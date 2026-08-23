import {render,screen} from "@testing-library/react";
import {describe,expect,it,vi} from "vitest";
import {AtelierHeroScene,ContinuousThread,FabricFoldTransition,GarmentMorph,ReducedMotionFallback,TailoringProcessTimeline} from "./Visuals";

vi.mock("motion/react",async()=>{const actual=await vi.importActual<typeof import("motion/react")>("motion/react");return {...actual,useScroll:()=>({scrollYProgress:actual.motionValue(.5)}),useReducedMotion:()=>false}});

describe("cinematic tailoring visuals",()=>{
  it("renders the real-photo hero without a red line over the photograph",()=>{render(<AtelierHeroScene/>);const scene=screen.getByTestId("atelier-hero-scene");expect(scene.querySelector(".hero-real-photo img")).toBeInTheDocument();expect(scene.querySelector(".red-thread")).not.toBeInTheDocument()});
  it("renders scroll-connected gutter paths and a needle",()=>{render(<ContinuousThread/>);const thread=screen.getByTestId("continuous-thread");expect(thread.querySelectorAll(".thread-track")).toHaveLength(2);expect(thread.querySelector(".thread-guide")).toBeInTheDocument()});
  it("exposes visible garment transformation state",()=>{const {rerender}=render(<GarmentMorph garment="formalwear"/>);expect(screen.getByRole("img")).toHaveAttribute("data-shortened","false");rerender(<GarmentMorph garment="formalwear" services={["formalHem","formalFit"]}/>);expect(screen.getByRole("img")).toHaveAttribute("data-shortened","true");expect(screen.getByRole("img")).toHaveAttribute("data-narrowed","true");expect(document.querySelector(".hem-new")).toBeInTheDocument()});
  it("renders the fold and all five timeline steps",()=>{render(<><FabricFoldTransition/><TailoringProcessTimeline title="Process" steps={["one","two","three","four","five"]} note="note"/></>);expect(screen.getByTestId("fabric-fold")).toBeInTheDocument();expect(screen.getByTestId("process-timeline").querySelectorAll("article")).toHaveLength(5)});
  it("keeps complete content in the motion fallback",()=>{render(<ReducedMotionFallback><p>Complete content</p></ReducedMotionFallback>);expect(screen.getByText("Complete content")).toBeVisible()});
});
