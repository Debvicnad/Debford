import { describe, it, expect } from "vitest";

describe("Commercial Auction Bid Validation Rules", () => {
  const minIncrement = 500;

  function validateBid(currentHighestBid: number, newBidAmount: number, reservePrice?: number) {
    if (newBidAmount <= currentHighestBid) {
      return { valid: false, error: "Bid must exceed the current highest bid" };
    }
    if (newBidAmount < currentHighestBid + minIncrement) {
      return {
        valid: false,
        error: `Bid must meet minimum increment of $${minIncrement}`,
      };
    }
    const reserveMet = reservePrice ? newBidAmount >= reservePrice : true;
    return { valid: true, reserveMet, newHighestBid: newBidAmount };
  }

  it("rejects bids that are lower than or equal to current highest bid", () => {
    const res = validateBid(35000, 35000);
    expect(res.valid).toBe(false);
    expect(res.error).toContain("must exceed");
  });

  it("rejects bids below the minimum increment threshold", () => {
    const res = validateBid(35000, 35200);
    expect(res.valid).toBe(false);
    expect(res.error).toContain("minimum increment");
  });

  it("accepts valid bids and monitors reserve price satisfaction", () => {
    const reserve = 40000;
    const underReserve = validateBid(35000, 37000, reserve);
    expect(underReserve.valid).toBe(true);
    expect(underReserve.reserveMet).toBe(false);

    const overReserve = validateBid(37000, 42000, reserve);
    expect(overReserve.valid).toBe(true);
    expect(overReserve.reserveMet).toBe(true);
    expect(overReserve.newHighestBid).toBe(42000);
  });
});
