import { app } from "./app";
import { env } from "./config/env";

app.listen(env.PORT, "0.0.0.0", () => {
  console.log(`EcoTrack API running on 0.0.0.0:${env.PORT}`);
});
