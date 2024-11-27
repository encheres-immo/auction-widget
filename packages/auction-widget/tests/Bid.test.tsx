import {
  test,
  expect,
  describe,
  beforeEach,
  vi,
  afterEach,
  Mock,
} from "vitest";
import { render, screen, fireEvent, cleanup } from "@solidjs/testing-library";
import client from "@encheres-immo/widget-client";
import { AuctionType, BidType } from "@encheres-immo/widget-client/types";
import { factoryAuction, factoryBid } from "./test-utils.js";
import Bid from "../src/Bid.jsx";

// Mock the widget-client module
vi.mock("@encheres-immo/widget-client", () => {
  return {
    default: {
      placeBidOnAuction: vi.fn(),
    },
  };
});

describe("Fast bid buttons", () => {
  let auction: AuctionType;

  beforeEach(() => {
    auction = factoryAuction();
  });

  afterEach(() => {
    cleanup();
  });

  test("displays correct amounts when auction has no bids", () => {
    // Create an auction with no bids and no highest bid
    const auctionWithoutBids = factoryAuction({
      bids: [],
      highestBid: undefined,
    });

    render(() => <Bid auction={auctionWithoutBids} />);

    // Check that the fast bid buttons are displayed with correct amounts
    const fastBidButtons = screen.getAllByRole("button", {
      name: /\+ [\d\s]+ €/i,
    });

    expect(fastBidButtons.length).toBe(3);

    // For the first offer, amounts are calculated as (stepMultiplier - 1) * auction.step
    const expectedAmounts = [
      0, // (1 - 1) * 100 = 0€
      100, // (2 - 1) * 100 = 100€
      200, // (3 - 1) * 100 = 200€
    ];

    fastBidButtons.forEach((button, index) => {
      const expectedAmount = expectedAmounts[index];
      expect(button.textContent).toContain(`+ ${expectedAmount} €`);
    });
  });

  test("displays correct amounts when auction has existing bids", () => {
    const highestBid: BidType = factoryBid();

    const auctionWithBids = factoryAuction({
      bids: [highestBid],
      highestBid: highestBid,
    });

    render(() => <Bid auction={auctionWithBids} />);

    // Check that the fast bid buttons are displayed with correct amounts
    const fastBidButtons = screen.getAllByRole("button", {
      name: /\+ [\d\s]+ €/i,
    });

    expect(fastBidButtons.length).toBe(3);

    // With previous bids, amounts are calculated as stepMultiplier * auction.step
    const expectedAmounts = [
      100, // 1 * 100 = 100€
      200, // 2 * 100 = 200€
      300, // 3 * 100 = 300€
    ];

    fastBidButtons.forEach((button, index) => {
      const expectedAmount = expectedAmounts[index];
      expect(button.textContent).toContain(`+ ${expectedAmount} €`);
    });
  });

  test("clicking opens confirm bid modal", async () => {
    render(() => <Bid auction={auction} />);
    const fastBidButton = screen.getAllByRole("button", {
      name: /\+ [\d\s]+ €/i,
    })[0];
    fireEvent.click(fastBidButton);
    // Confirm modal should be visible
    expect(
      screen.getByText(/Vous êtes sur le point d'enchérir/i)
    ).toBeInTheDocument();
  });
});

describe("Custom bid input", () => {
  let auction: AuctionType;

  beforeEach(() => {
    auction = factoryAuction();
  });

  afterEach(() => {
    cleanup();
  });

  test("filling and clicking opens confirm bid modal", async () => {
    render(() => <Bid auction={auction} />);
    const amountInput = screen.getByRole("spinbutton");
    const bidButton = screen.getByText(/Enchérir/i);
    fireEvent.input(amountInput, { target: { value: "2000" } });
    fireEvent.click(bidButton);
    // Confirm modal should be visible
    expect(
      screen.getByText(/Vous êtes sur le point d'enchérir/i)
    ).toBeInTheDocument();
  });
});

describe("Modal confirm bid", () => {
  let auction: AuctionType;

  beforeEach(() => {
    auction = factoryAuction();
    (client.placeBidOnAuction as Mock).mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  test("places bid when confirm button is clicked", async () => {
    // Set up the mock to resolve to a bid
    (client.placeBidOnAuction as Mock).mockResolvedValue(factoryBid());
    render(() => <Bid auction={auction} />);
    const fastBidButton = screen.getAllByRole("button", {
      name: /\+ [\d\s]+ €/i,
    })[0];
    fireEvent.click(fastBidButton);

    const confirmButton = screen.getByText(/Confirmer/i);
    fireEvent.click(confirmButton);

    // Wait for the mock function to be called
    await expect(client.placeBidOnAuction).toHaveBeenCalled();
  });

  test("displays an error when bid amount is too low", async () => {
    const error = { code: "bid_amount_too_low", min: 1500 };
    (client.placeBidOnAuction as Mock).mockRejectedValue(error);
    render(() => <Bid auction={auction} />);
    const fastBidButton = screen.getAllByRole("button", {
      name: /\+ [\d\s]+ €/i,
    })[0];
    fireEvent.click(fastBidButton);

    const confirmButton = screen.getByText(/Confirmer/i);
    fireEvent.click(confirmButton);

    // Wait for the error message to be displayed
    expect(
      await screen.findByText(/Vous devez au moins enchérir/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/1500 €/)).toBeInTheDocument();
  });
});