const { calculateStampDuty } = require("../services/stampDuty.service");

module.exports = async function (fastify) {
  fastify.post("/api/stamp-duty/calculate", async (req, reply) => {
    try {
      const result = await calculateStampDuty(req.body);
      return { success: true, data: result };
    } catch (err) {
      reply.code(400).send({
        success: false,
        message: err.message
      });
    }
  });
};
