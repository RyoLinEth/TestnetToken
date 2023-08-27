
export const calculatePrimes = (iterations, multiplier) => {
    postMessage("Initializing Worker");
    const result = iterations * multiplier;
    postMessage(result)
}