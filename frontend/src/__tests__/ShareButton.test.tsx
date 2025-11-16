import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ShareButton from "../components/ShareButton";
import { ToastProvider } from "../contexts/ToastContext";

// Mock the toast context
const mockAddToast = vi.fn();
vi.mock("../contexts/ToastContext", () => ({
  useToast: () => ({ addToast: mockAddToast }),
  ToastProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// Mock navigator.share
const mockShare = vi.fn();
Object.defineProperty(navigator, "share", {
  value: mockShare,
  writable: true,
});

// Mock navigator.clipboard
const mockWriteText = vi.fn();
Object.defineProperty(navigator, "clipboard", {
  value: { writeText: mockWriteText },
  writable: true,
});

// Mock window.open
const mockOpen = vi.fn();
global.open = mockOpen;

// Mock window.location
delete (global as any).window.location;
(global as any).window.location = {
  origin: "http://localhost:3000",
};

describe("ShareButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockShare.mockResolvedValue(undefined);
    mockWriteText.mockResolvedValue(undefined);
  });

  it("renders share button", () => {
    render(
      <ToastProvider>
        <ShareButton url="/test" title="Test Dream" />
      </ToastProvider>,
    );
    expect(
      screen.getByRole("button", { name: /share this dream/i }),
    ).toBeInTheDocument();
  });

  it("opens modal when clicked", () => {
    render(
      <ToastProvider>
        <ShareButton url="/test" title="Test Dream" />
      </ToastProvider>,
    );

    const button = screen.getByRole("button", { name: /share this dream/i });
    fireEvent.click(button);

    expect(screen.getByText("Share Dream")).toBeInTheDocument();
    expect(screen.getByText("Test Dream")).toBeInTheDocument();
  });

  it("shows native share button when available", () => {
    render(
      <ToastProvider>
        <ShareButton url="/test" title="Test Dream" />
      </ToastProvider>,
    );

    const button = screen.getByRole("button", { name: /share this dream/i });
    fireEvent.click(button);

    expect(screen.getByText("Share via Device")).toBeInTheDocument();
  });

  it("calls navigator.share when native share is clicked", async () => {
    render(
      <ToastProvider>
        <ShareButton
          url="/test"
          title="Test Dream"
          description="Test description"
        />
      </ToastProvider>,
    );

    const button = screen.getByRole("button", { name: /share this dream/i });
    fireEvent.click(button);

    const shareButton = screen.getByText("Share via Device");
    fireEvent.click(shareButton);

    await waitFor(() => {
      expect(mockShare).toHaveBeenCalledWith({
        title: "Test Dream",
        text: "Test Dream - Test description",
        url: "http://localhost:3000/test",
      });
    });
  });

  it("copies link to clipboard", async () => {
    render(
      <ToastProvider>
        <ShareButton url="/test" title="Test Dream" />
      </ToastProvider>,
    );

    const button = screen.getByRole("button", { name: /share this dream/i });
    fireEvent.click(button);

    const copyButton = screen.getByText("Copy Link");
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith("http://localhost:3000/test");
      expect(mockAddToast).toHaveBeenCalledWith(
        "Link copied to clipboard!",
        "success",
      );
    });
  });

  it("handles clipboard error", async () => {
    mockWriteText.mockRejectedValue(new Error("Clipboard error"));

    render(
      <ToastProvider>
        <ShareButton url="/test" title="Test Dream" />
      </ToastProvider>,
    );

    const button = screen.getByRole("button", { name: /share this dream/i });
    fireEvent.click(button);

    const copyButton = screen.getByText("Copy Link");
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith("Failed to copy link", "error");
    });
  });

  it("shares to Telegram", () => {
    render(
      <ToastProvider>
        <ShareButton url="/test" title="Test Dream" />
      </ToastProvider>,
    );

    const button = screen.getByRole("button", { name: /share this dream/i });
    fireEvent.click(button);

    const telegramButton = screen.getByText("Telegram");
    fireEvent.click(telegramButton);

    expect(mockOpen).toHaveBeenCalledWith(
      expect.stringContaining("https://t.me/share/url"),
      "_blank",
      "noopener,noreferrer",
    );
  });

  it("shares to Twitter", () => {
    render(
      <ToastProvider>
        <ShareButton url="/test" title="Test Dream" />
      </ToastProvider>,
    );

    const button = screen.getByRole("button", { name: /share this dream/i });
    fireEvent.click(button);

    const twitterButton = screen.getByText("Twitter");
    fireEvent.click(twitterButton);

    expect(mockOpen).toHaveBeenCalledWith(
      expect.stringContaining("https://twitter.com/intent/tweet"),
      "_blank",
      "noopener,noreferrer",
    );
  });

  it("shares to Facebook", () => {
    render(
      <ToastProvider>
        <ShareButton url="/test" title="Test Dream" />
      </ToastProvider>,
    );

    const button = screen.getByRole("button", { name: /share this dream/i });
    fireEvent.click(button);

    const facebookButton = screen.getByText("Facebook");
    fireEvent.click(facebookButton);

    expect(mockOpen).toHaveBeenCalledWith(
      expect.stringContaining("https://www.facebook.com/sharer/sharer.php"),
      "_blank",
      "noopener,noreferrer",
    );
  });

  it("displays share URL", () => {
    render(
      <ToastProvider>
        <ShareButton url="/test" title="Test Dream" />
      </ToastProvider>,
    );

    const button = screen.getByRole("button", { name: /share this dream/i });
    fireEvent.click(button);

    expect(screen.getByText("http://localhost:3000/test")).toBeInTheDocument();
  });

  it("constructs share text without description", () => {
    render(
      <ToastProvider>
        <ShareButton url="/test" title="Test Dream" />
      </ToastProvider>,
    );

    const button = screen.getByRole("button", { name: /share this dream/i });
    fireEvent.click(button);

    // The share text should be constructed correctly
    const shareButton = screen.getByText("Share via Device");
    fireEvent.click(shareButton);

    expect(mockShare).toHaveBeenCalledWith({
      title: "Test Dream",
      text: "Check out this dream: Test Dream",
      url: "http://localhost:3000/test",
    });
  });
});
