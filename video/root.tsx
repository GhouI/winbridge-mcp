import React from "react";
import { Composition } from "remotion";
import { PendragonDemo } from "./pendragon-demo";

export function RemotionRoot() {
  return (
    <Composition
      id="PendragonDemo"
      component={PendragonDemo}
      durationInFrames={360}
      fps={30}
      width={1280}
      height={720}
    />
  );
}
