import { render, screen } from "@testing-library/react";
import ProtectedLayout from "./ProtectedLayout";
import { useAuth } from "./AuthProvider";
import { useRouter, usePathname } from "next/navigation";

jest.mock("./AuthProvider");
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

describe("ProtectedLayout", () => {
  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render children for authenticated users", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { name: "Test User" },
      loading: false,
    });
    (usePathname as jest.Mock).mockReturnValue("/dashboard");

    render(
      <ProtectedLayout>
        <div>Child Component</div>
      </ProtectedLayout>,
    );

    expect(screen.getByText("Child Component")).toBeInTheDocument();
  });

  it("should redirect unauthenticated users to login page", () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null, loading: false });
    (usePathname as jest.Mock).mockReturnValue("/dashboard");

    render(
      <ProtectedLayout>
        <div>Child Component</div>
      </ProtectedLayout>,
    );

    expect(mockRouter.push).toHaveBeenCalledWith("/login");
  });

  it("should render children on public routes for unauthenticated users", () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null, loading: false });
    (usePathname as jest.Mock).mockReturnValue("/login");

    render(
      <ProtectedLayout>
        <div>Login Page</div>
      </ProtectedLayout>,
    );

    expect(screen.getByText("Login Page")).toBeInTheDocument();
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it("should redirect authenticated users from login page to dashboard", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { name: "Test User" },
      loading: false,
    });
    (usePathname as jest.Mock).mockReturnValue("/login");

    render(
      <ProtectedLayout>
        <div>Login Page</div>
      </ProtectedLayout>,
    );

    expect(mockRouter.push).toHaveBeenCalledWith("/");
  });

  it("should render loading spinner while auth state is loading", () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null, loading: true });
    (usePathname as jest.Mock).mockReturnValue("/dashboard");

    render(
      <ProtectedLayout>
        <div>Child Component</div>
      </ProtectedLayout>,
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });
});
