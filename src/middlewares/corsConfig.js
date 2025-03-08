import cors from "cors";

const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "DELETE", "PUT"],
};

export default cors(corsOptions);
