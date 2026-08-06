import "./index.css";
import { Composition } from "remotion";
import { SwiftTabPromo } from "./SwiftTabPromo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="SwiftTabPromo"
        component={SwiftTabPromo}
        durationInFrames={1500}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
