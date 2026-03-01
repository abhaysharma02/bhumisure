const { pool, connectDB } = require("./db");

const initDatabase = async () => {
  await connectDB(); // Must wait for sqlite to open
  const client = await pool.connect();
  try {
    await client.query('BEGIN TRANSACTION');

    // Wards Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS wards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ward_number VARCHAR(100),
        tehsil VARCHAR(100),
        urban_local_body VARCHAR(100)
      );
    `);

    // Locations Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS locations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ward_id INTEGER REFERENCES wards(id) ON DELETE CASCADE,
        locality_name VARCHAR(255),
        road_type VARCHAR(100)
      );
    `);

    // Rates Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS rates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        location_id INTEGER REFERENCES locations(id) ON DELETE CASCADE,
        financial_year VARCHAR(20) DEFAULT '2025-26',
        residential_plot_rate NUMERIC,
        commercial_plot_rate NUMERIC,
        industrial_rate NUMERIC,
        rcc_rate NUMERIC,
        rbc_rate NUMERIC,
        tin_shed_rate NUMERIC,
        multi_storey_res_rate NUMERIC,
        multi_storey_com_rate NUMERIC,
        agricultural_irrigated_rate NUMERIC,
        agricultural_non_irrigated_rate NUMERIC,
        UNIQUE(location_id, financial_year)
      );
    `);

    // Guideline Rates Table (for CSV import)
    await client.query(`
      CREATE TABLE IF NOT EXISTS guideline_rates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        city VARCHAR(100),
        ward VARCHAR(100),
        location VARCHAR(255),
        residential_rate INTEGER,
        commercial_rate INTEGER,
        shop_rate INTEGER,
        office_rate INTEGER,
        agriculture_rate INTEGER,
        year VARCHAR(20)
      );
    `);

    // Seed Sample Data if Wards table is empty
    const wResult = await client.query("SELECT COUNT(*) as cnt FROM wards");
    if (wResult.rows[0].cnt === 0) {
      console.log("Seeding initial sample data...");
      await client.query(`INSERT INTO wards (ward_number, tehsil, urban_local_body) VALUES ('Ward 1', 'Gwalior', 'Gwalior Municipal Corporation')`);
      await client.query(`INSERT INTO wards (ward_number, tehsil, urban_local_body) VALUES ('Ward 2', 'Morar', 'Gwalior Municipal Corporation')`);
      await client.query(`INSERT INTO wards (ward_number, tehsil, urban_local_body) VALUES ('Ward 3', 'Lashkar', 'Gwalior Municipal Corporation')`);

      const wardsList = await client.query("SELECT id FROM wards ORDER BY id");
      const w1 = wardsList.rows[0].id;
      const w2 = wardsList.rows[1].id;

      // Seed Locations
      await client.query(`INSERT INTO locations (ward_id, locality_name, road_type) VALUES (?, 'City Center Area', 'Main Road')`, [w1]);
      await client.query(`INSERT INTO locations (ward_id, locality_name, road_type) VALUES (?, 'Govindpuri', 'Inner Road')`, [w1]);
      await client.query(`INSERT INTO locations (ward_id, locality_name, road_type) VALUES (?, 'Deen Dayal Nagar', 'Main Road')`, [w2]);
      await client.query(`INSERT INTO locations (ward_id, locality_name, road_type) VALUES (?, 'Morar Cantt', 'Inner Road')`, [w2]);

      const locList = await client.query("SELECT id FROM locations ORDER BY id");

      // Seed Rates
      // City Center (High)
      await client.query(`INSERT INTO rates (location_id, financial_year, residential_plot_rate, commercial_plot_rate, industrial_rate, agricultural_irrigated_rate, agricultural_non_irrigated_rate)
                VALUES (?, '2025-26', 45000, 80000, 20000, 800000, 500000)`, [locList.rows[0].id]);

      // Govindpuri
      await client.query(`INSERT INTO rates (location_id, financial_year, residential_plot_rate, commercial_plot_rate, industrial_rate, agricultural_irrigated_rate, agricultural_non_irrigated_rate)
                VALUES (?, '2025-26', 30000, 50000, 15000, 600000, 400000)`, [locList.rows[1].id]);

      // DD Nagar
      await client.query(`INSERT INTO rates (location_id, financial_year, residential_plot_rate, commercial_plot_rate, industrial_rate, agricultural_irrigated_rate, agricultural_non_irrigated_rate)
                VALUES (?, '2025-26', 22000, 35000, 10000, 450000, 250000)`, [locList.rows[2].id]);

      // Morar
      await client.query(`INSERT INTO rates (location_id, financial_year, residential_plot_rate, commercial_plot_rate, industrial_rate, agricultural_irrigated_rate, agricultural_non_irrigated_rate)
                VALUES (?, '2025-26', 15000, 25000, 8000, 300000, 150000)`, [locList.rows[3].id]);
    }

    await client.query('COMMIT');
    console.log("✅ Database schema initialized and seeded successfully!");
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("❌ Failed to initialize schema:", err.message);
  } finally {
    client.release();
  }
};

if (require.main === module) {
  initDatabase().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = initDatabase;
