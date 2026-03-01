const fs = require('fs');
const path = require('path');
const { pool, connectDB } = require('./src/config/db');

async function parseAndSeed() {
    console.log("🚀 Starting Data Structuring Engine...");

    // Connect to DB
    await connectDB();

    const filePath = path.join(__dirname, 'raw_data.txt');
    if (!fs.existsSync(filePath)) {
        console.error("❌ raw_data.txt not found! Please create it inside the backend folder and paste your full OCR text.");
        process.exit(1);
    }

    const rawText = fs.readFileSync(filePath, 'utf-8');
    const lines = rawText.split('\n');

    const client = await pool.connect();

    try {
        await client.query('BEGIN TRANSACTION');

        // Clear existing data
        await client.query('DELETE FROM rates');
        await client.query('DELETE FROM locations');
        await client.query('DELETE FROM wards');
        console.log("🧹 Cleared existing data.");

        let currentWardId = null;
        let wardCount = 0;
        let locCount = 0;

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();
            if (!line) continue;

            // Detect Ward Header
            // Example: शहरी Łथानीय ƨनकाय : Īवाƨलयर, उप ŬेŊ : नगर ƨनगम Īवाƨलयर, वाडƚ : वाडƚ ०१, तहसील : Īवाƨलयर
            if (line.includes('वाडƚ :') && line.includes('तहसील :')) {
                const wardMatch = line.match(/वाडƚ\s*:\s*(?:वाडƚ)?\s*([०-९0-9]+)/);
                const tehsilMatch = line.match(/तहसील\s*:\s*([^\s]+)/);

                if (wardMatch) {
                    // Convert Hindi numerals to English just in case
                    const hindiToEng = { '०': '0', '१': '1', '२': '2', '३': '3', '४': '4', '५': '5', '६': '6', '७': '7', '८': '8', '९': '9' };
                    let wNum = wardMatch[1].replace(/[०-९]/g, m => hindiToEng[m]);
                    let tehsil = tehsilMatch ? tehsilMatch[1] : 'Īवाƨलयर';

                    const res = await client.query(
                        `INSERT INTO wards (ward_number, tehsil, urban_local_body) VALUES (?, ?, 'Gwalior Municipal Corporation') RETURNING id`,
                        [`Ward ${parseInt(wNum)}`, tehsil]
                    );

                    // Handle RETURNING id for our mock SQLite implementation which returns lastID instead in some drivers
                    // but our mock returns { lastID } on INSERT
                    currentWardId = res.lastID;
                    if (!currentWardId && res.rows && res.rows.length) {
                        currentWardId = res.rows[0].id;
                    }

                    // Fallback if RETURNING didn't work (depending on sqlite3 version)
                    if (!currentWardId) {
                        const rr = await client.query("SELECT last_insert_rowid() as id");
                        currentWardId = rr.rows[0].id;
                    }

                    wardCount++;
                    console.log(`📌 Found Ward: ${parseInt(wNum)}`);
                }
                continue;
            }

            // Extract Numbers & Locality from the string
            // Line example: 1 20 सूŊीय नगर, जनकताल 9,00013,500 9,00022,000 ... 1,04,00,000 1,04,00,000 9,000 13,500

            // Extract all numbers (handling commas)
            const numberRegex = /[0-9]{1,3}(?:,[0-9]{2,3})*/g;
            const matches = [...line.matchAll(numberRegex)];

            if (matches.length > 5 && currentWardId) {
                // To handle merged text like "9,00013,500", let's split any number chunk that looks obviously merged
                let extractedNums = [];
                for (let m of matches) {
                    let numStr = m[0];
                    // If a number has multiple commas but no proper grouping, e.g., 9,00013,500
                    // Let's rely on exactly parsing 16 values if we can, but OCR merges might break cleanly.
                    // Let's just remove commas and if length is 8 or more and not a land rate, it might be merged.
                    // A safer bet: Just strip commas, then if length > 4 and no commas existed, it's suspect.
                    // But wait, "9,00013,500" has commas.
                    let cleanedNums = numStr.split(/(?=(?:[1-9][0-9]*000|0)$)/); // heuristic to break on thousands
                    // A simpler way: Find all valid standalone rates from the line directly using a clever regex:
                }

                // Let's just blindly extract all digits ignoring commas
                let justDigitsString = line.replace(/[^0-9,]/g, ' ').trim();
                let splitNums = justDigitsString.split(/\s+/).filter(Boolean);

                // Further split things like "9,00013,500"
                let finalNums = [];
                splitNums.forEach(sn => {
                    // Remove commas
                    let s = sn.replace(/,/g, '');
                    // MP rates usually end in multiple zeros. Let's assume minimum value is 1000 and ends in 00.
                    // Extract chunks of numbers ending in 00
                    let chunks = s.match(/[1-9][0-9]*[0]{2,}/g) || [s];
                    finalNums.push(...chunks.map(Number));
                });

                // The string before the numbers is the locality name.
                // We'll strip out all numbers from the original line to get the text.
                let textPart = line.replace(/[0-9,]/g, '').trim();
                textPart = textPart.replace(/^[-\.\s]+/, ''); // trim leading symbols
                if (textPart.length > 3) {

                    // Insert Location
                    await client.query(`INSERT INTO locations (ward_id, locality_name, road_type) VALUES (?, ?, 'Main/Inner')`, [currentWardId, textPart]);
                    const rr = await client.query("SELECT last_insert_rowid() as id");
                    const locId = rr.rows[0].id;

                    // Pad default rates if OCR missed some
                    while (finalNums.length < 16) finalNums.push(0);

                    // Grab the values corresponding to columns (based on 16 columns logic)
                    // finalNums array should map: 0:Res, 1:Com, 2:Ind, 3:RCC, 4:RBC, 5:Tin, 6:Kacha, 7:Shop, 8:Godown, 9:MultiRes, 10:MultiCom, 11:AgIrr, 12:AgNon, 13:UpRes, 14:UpCom
                    await client.query(`
                        INSERT INTO rates (
                            location_id, financial_year, 
                            residential_plot_rate, commercial_plot_rate, industrial_rate,
                            rcc_rate, rbc_rate, tin_shed_rate,
                            multi_storey_res_rate, multi_storey_com_rate,
                            agricultural_irrigated_rate, agricultural_non_irrigated_rate
                        ) VALUES (?, '2025-26', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `, [
                        locId,
                        finalNums[0] || 0, // Res Plot
                        finalNums[1] || 0, // Com Plot
                        finalNums[2] || 0, // Ind Plot
                        finalNums[3] || 0, // RCC
                        finalNums[4] || 0, // RBC
                        finalNums[5] || 0, // Tin Shed
                        finalNums[9] || 0, // Multi Res
                        finalNums[10] || 0, // Multi Com
                        finalNums[11] || 0, // Ag Irrigated
                        finalNums[12] || 0  // Ag Non-irrigated
                    ]);
                    locCount++;
                }
            }
        }

        await client.query('COMMIT');
        console.log(`✅ Success! Processed ${wardCount} Wards and ${locCount} Locations.`);

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("❌ Failed to parse and seed data:", err);
    } finally {
        // client.release();
        process.exit(0);
    }
}

parseAndSeed();
