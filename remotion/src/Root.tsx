
import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { EmailReplyFeature } from "./EmailReplyFeature";

import { IntegrationTestScene, HelloWorldIntro, TheHook, TheProblem, TheSolution, KeyFeatures, CallToAction } from "./scenes";
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MyComp"
        component={MyComposition}
        durationInFrames={60}
        fps={30}
        width={1280}
        height={720}
      />
      <Composition
        id="feature-email"
        component={EmailReplyFeature}
        durationInFrames={120}
        fps={30}
        width={1080}
        height={1080}
      />
                            <Composition
        id="integration-test-scene"
        component={IntegrationTestScene}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
      />
          <Composition
        id="hello-world-intro"
        component={HelloWorldIntro}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
      />
                                                                                                                                              <Composition
        id="the-hook"
        component={TheHook}
        durationInFrames={120}
        fps={30}
        width={1920}
        height={1080}
      />
                <Composition
        id="the-problem"
        component={TheProblem}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
                <Composition
        id="the-solution"
        component={TheSolution}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
          <Composition
        id="key-features"
        component={KeyFeatures}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
      />
          <Composition
        id="cta-start-free"
        component={CallToAction}
        durationInFrames={120}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
