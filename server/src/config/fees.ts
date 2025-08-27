// Server-side fee configuration map. Keep authoritative fee amounts here.
export const FeeMap: Record<string, string> = {
  // keys are canonical serviceType values used by the app
  "Birth Certificate": "50.00",
  "Property Tax": "100.00",
  "Trade License": "250.00",
};

export const getFeeForService = (serviceType: string) => {
  const fee = FeeMap[serviceType];
  if (!fee) return "0.00";
  return fee;
};

export default { FeeMap, getFeeForService };
