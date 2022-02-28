import { Home } from "..";
import { render, waitFor } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { MemoryRouter } from "react-router-dom";

describe("Home", () => {
  describe("search input", () => {
    window.scrollTo = () => {};
    global.matchMedia =
      global.matchMedia ||
      function () {
        return {
          addListener: jest.fn(),
          removeListener: jest.fn(),
        };
      };
    it("renders an empty search input on first render", async () => {
      const { getByPlaceholderText } = render(
        <MockedProvider mocks={[]}>
          <MemoryRouter initialEntries={["/"]}>
            <Home />
          </MemoryRouter>
        </MockedProvider>
      );

      await waitFor(() => {
        const searchInput = getByPlaceholderText(
          "Search 'San Francisco'"
        ) as HTMLInputElement;
        expect(searchInput.value).toEqual("");
      });
    });
  });
});
