import { reporter } from "../reporter/ws-reporter";
import { FunctionTracer } from "./trace-that";

const tracer = new FunctionTracer(reporter);

/**
 * Tracks execution of a function. Sends the metrics after the function finishes.
 * @param fn
 * @returns decorated function
 */
export const traceThat = tracer.traceThat.bind(tracer) as (typeof tracer)["traceThat"];
