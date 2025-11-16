import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import Badge from "../components/Badge";

describe("Badge", () => {
  it("renders children correctly", () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("applies default variant and size", () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByText("Default");
    expect(badge).toHaveClass(
      "bg-primary",
      "text-white",
      "px-3",
      "py-1",
      "text-sm",
    );
  });

  it("applies success variant", () => {
    render(<Badge variant="success">Success</Badge>);
    const badge = screen.getByText("Success");
    expect(badge).toHaveClass("bg-green-500", "text-white");
  });

  it("applies warning variant", () => {
    render(<Badge variant="warning">Warning</Badge>);
    const badge = screen.getByText("Warning");
    expect(badge).toHaveClass("bg-yellow-500", "text-white");
  });

  it("applies danger variant", () => {
    render(<Badge variant="danger">Danger</Badge>);
    const badge = screen.getByText("Danger");
    expect(badge).toHaveClass("bg-red-500", "text-white");
  });

  it("applies info variant", () => {
    render(<Badge variant="info">Info</Badge>);
    const badge = screen.getByText("Info");
    expect(badge).toHaveClass("bg-blue-500", "text-white");
  });

  it("applies small size", () => {
    render(<Badge size="sm">Small</Badge>);
    const badge = screen.getByText("Small");
    expect(badge).toHaveClass("px-2", "py-1", "text-xs");
  });

  it("applies large size", () => {
    render(<Badge size="lg">Large</Badge>);
    const badge = screen.getByText("Large");
    expect(badge).toHaveClass("px-4", "py-2", "text-base");
  });

  it("applies custom className", () => {
    render(<Badge className="custom-class">Custom</Badge>);
    const badge = screen.getByText("Custom");
    expect(badge).toHaveClass("custom-class");
  });

  it("has correct base classes", () => {
    render(<Badge>Test</Badge>);
    const badge = screen.getByText("Test");
    expect(badge).toHaveClass(
      "inline-flex",
      "items-center",
      "font-medium",
      "rounded-full",
    );
  });
});
