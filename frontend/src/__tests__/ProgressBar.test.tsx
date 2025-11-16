import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import ProgressBar from "../components/ProgressBar";

describe("ProgressBar", () => {
  it("renders with default props", () => {
    render(<ProgressBar progress={50} />);
    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute("aria-valuenow", "50");
    expect(progressBar).toHaveAttribute("aria-valuemin", "0");
    expect(progressBar).toHaveAttribute("aria-valuemax", "100");
    expect(progressBar).toHaveAttribute("aria-label", "Progress: 50%");
  });

  it("clamps progress to 0-100 range", () => {
    render(<ProgressBar progress={150} />);
    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toHaveAttribute("aria-valuenow", "100");
  });

  it("handles negative progress", () => {
    render(<ProgressBar progress={-10} />);
    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toHaveAttribute("aria-valuenow", "0");
  });

  it("applies primary color by default", () => {
    render(<ProgressBar progress={75} />);
    const progressFill = screen.getByRole("progressbar").firstElementChild;
    expect(progressFill).toHaveClass("bg-primary");
  });

  it("applies success color", () => {
    render(<ProgressBar progress={75} color="success" />);
    const progressFill = screen.getByRole("progressbar").firstElementChild;
    expect(progressFill).toHaveClass("bg-green-500");
  });

  it("applies warning color", () => {
    render(<ProgressBar progress={75} color="warning" />);
    const progressFill = screen.getByRole("progressbar").firstElementChild;
    expect(progressFill).toHaveClass("bg-yellow-500");
  });

  it("applies danger color", () => {
    render(<ProgressBar progress={75} color="danger" />);
    const progressFill = screen.getByRole("progressbar").firstElementChild;
    expect(progressFill).toHaveClass("bg-red-500");
  });

  it("shows label when showLabel is true", () => {
    render(<ProgressBar progress={75} showLabel={true} />);
    expect(screen.getByText("Progress")).toBeInTheDocument();
    expect(screen.getByText("75%")).toBeInTheDocument();
  });

  it("hides label by default", () => {
    render(<ProgressBar progress={75} />);
    expect(screen.queryByText("Progress")).not.toBeInTheDocument();
    expect(screen.queryByText("75%")).not.toBeInTheDocument();
  });

  it("applies animated class by default", () => {
    render(<ProgressBar progress={75} />);
    const progressFill = screen.getByRole("progressbar").firstElementChild;
    expect(progressFill).toHaveClass("animate-pulse");
  });

  it("removes animation when animated is false", () => {
    render(<ProgressBar progress={75} animated={false} />);
    const progressFill = screen.getByRole("progressbar").firstElementChild;
    expect(progressFill).not.toHaveClass("animate-pulse");
  });

  it("applies custom className", () => {
    render(<ProgressBar progress={50} className="custom-class" />);
    const container = screen.getByRole("progressbar").parentElement;
    expect(container).toHaveClass("custom-class");
  });

  it("sets correct width based on progress", () => {
    render(<ProgressBar progress={25} />);
    const progressFill = screen.getByRole("progressbar")
      .firstElementChild as HTMLElement;
    expect(progressFill.style.width).toBe("25%");
  });

  it("has correct base classes", () => {
    render(<ProgressBar progress={50} />);
    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toHaveClass(
      "w-full",
      "bg-gray-200",
      "dark:bg-gray-700",
      "rounded-full",
      "h-3",
      "overflow-hidden",
      "shadow-inner",
    );
  });
});
