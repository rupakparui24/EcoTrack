import { app } from "./app";
import { env } from "./config/env";

app.listen(env.PORT, () => {
  console.log(`EcoTrack API running on port ${env.PORT}`);
});

