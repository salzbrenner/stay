import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Input, Layout } from "antd";
import { Viewer } from "../../lib/types";
import { MenuItems } from "./components";
import { displayErrorMessage } from "../../lib/utils";

interface Props {
  viewer: Viewer;
  setViewer: (viewer: Viewer) => void;
}

const { Header } = Layout;
const { Search } = Input;

export const AppHeader = ({ viewer, setViewer }: Props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState("");

  useEffect(() => {
    const { pathname } = location;
    const pathnameSub = pathname.split("/");
    if (!pathname.includes("/listings")) {
      return setSearch("");
    }

    if (pathname.includes("/listings") && pathnameSub.length === 3) {
      return setSearch(decodeURIComponent(pathnameSub[2]));
    }
  }, [location]);

  const onSearch = (value: string) => {
    const trimmedValue = value.trim();

    if (trimmedValue) {
      navigate(`/listings/${trimmedValue}`);
    } else {
      displayErrorMessage("Please enter a valid search");
    }
  };

  return (
    <Header className="app-header">
      <div className="app-header__logo-search-section">
        <div className="app-header__logo">
          <Link to="/">
            <span> Stay</span>
          </Link>
        </div>
        <div className="app-header__search-input">
          <Search
            placeholder="Search 'Los Angeles'"
            enterButton
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onSearch={onSearch}
          />
        </div>
      </div>
      <div className="app-header__menu-section">
        <MenuItems viewer={viewer} setViewer={setViewer} />
      </div>
    </Header>
  );
};
