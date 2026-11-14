import type { Metadata } from "next";
import { DemoClient } from "./demo-client";

export const metadata: Metadata = {
  title: "Scenario Simulation — RippleNet",
  description: "Explore illustrative flood-relief workflows using static sample scenarios. This page does not run live AI inference.",
};

export default function DemoPage() {
  return <DemoClient />;
}
