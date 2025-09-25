import { z } from "zod";
import { publicProcedure } from "../../../create-context";

export default publicProcedure
  .input(z.object({ name: z.string().optional() }).optional())
  .query(({ input }) => {
    return {
      hello: input?.name || "World",
      message: "ZestBet API is working!",
      date: new Date(),
      status: "success"
    };
  });