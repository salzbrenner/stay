import React from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@apollo/react-hooks";
import { Avatar, Button, Menu } from "antd";
import { UserOutlined, LogoutOutlined, HomeOutlined } from "@ant-design/icons";
import { LOG_OUT } from "../../../../lib/graphql/mutations";
import { LogOut as LogOutData } from "../../../../lib/graphql/mutations/Logout/__generated__/LogOut";
import {
  displaySuccessNotification,
  displayErrorMessage,
} from "../../../../lib/utils";
import { Viewer } from "../../../../lib/types";

interface Props {
  viewer: Viewer;
  setViewer: (viewer: Viewer) => void;
}

const { Item, SubMenu } = Menu;

export const MenuItems = ({ viewer, setViewer }: Props) => {
  const [logOut] = useMutation<LogOutData>(LOG_OUT, {
    onCompleted: (data) => {
      if (data && data.logOut) {
        setViewer(data.logOut);
        displaySuccessNotification("You've successfully logged out!");
      }
    },
    onError: () => {
      displayErrorMessage(
        "Sorry! We weren't able to log you out. Please try again later!"
      );
    },
  });

  const handleLogOut = () => {
    logOut();
  };

  const subMenuLogin =
    viewer.id && viewer.avatar ? (
      <SubMenu title={<Avatar src={viewer.avatar} />}>
        <Item key="/user">
          <Link to={`/user/${viewer.id}`}>
            <UserOutlined className="mr-1" />
            Profile
          </Link>
        </Item>
        <Item key="/logout">
          <div onClick={handleLogOut}>
            <LogoutOutlined className="mr-1" />
            Log out
          </div>
        </Item>
      </SubMenu>
    ) : (
      <Item key={"/login"}>
        <Link to="/login">
          <Button type="primary">Sign In</Button>
        </Link>
      </Item>
    );

  return (
    <Menu
      mode="horizontal"
      selectable={false}
      className="menu"
      disabledOverflow={true}
    >
      <Item key="/host">
        <Link to="/host">
          <HomeOutlined style={{ color: "#1d226c" }} className="mr-1" />
          Host
        </Link>
      </Item>
      {subMenuLogin}
    </Menu>
  );
};
