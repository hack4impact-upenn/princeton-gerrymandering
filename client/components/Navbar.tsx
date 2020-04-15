import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom'

import { Layout, Menu } from 'antd';
import Icon, { MenuOutlined } from '@ant-design/icons';

import SubMenu from 'antd/lib/menu/SubMenu';

import useWindowSize from "../util/useWindowSize";
import { Link } from 'react-router-dom';


interface NavbarProps {
    // selected : which one of the menu items shows as selected (underlined)
    selected?: string
    hideMenu?: boolean
};

const Navbar: React.FC<NavbarProps> = ({ selected = "", hideMenu = false}: NavbarProps) => {
    const [width, height] = useWindowSize();
    // Breakpoint width to change from desktop menu to mobile menu
    const menuBreakpoint = 768;

    return (
        <Layout.Header style={{ position: 'fixed', zIndex: 1, width: '100%', lineHeight: "1" }}>
            <div className="logo" style={{
                height: "31px",
                margin: "20px 24px 16px 0",
                float: "left"
            }}>
                <Link to = "/">
                    <h1>Hofeller Files</h1>
                    </Link>
            </div>

            {/* Render regular menu if big enough */}
            {width > menuBreakpoint && !hideMenu &&
                <Menu

                    mode="horizontal"
                    style={{ lineHeight: '62px', float: "right", borderBottom: "none" }}
                    defaultSelectedKeys={[selected]}
                >
                    {/* <Menu.Item key="about">
                        <Link to="/about">About</Link>
                    </Menu.Item>
                    <Menu.Item key="projects">
                        <Link to="/project">Projects</Link>
                    </Menu.Item>
                    <Menu.Item key="apply">
                        <Link to="/apply">Apply</Link>
                    </Menu.Item> */}
                </Menu>
            }

            {/* Render mobile menu if too small */}
            {width <= menuBreakpoint && !hideMenu &&
                <Menu
                    mode="horizontal"
                    style={{ lineHeight: '62px', float: "right", borderBottom: "none" }}
                >
                    {/* <SubMenu title={<MenuOutlined></MenuOutlined>}>
                        <Menu.Item key="about">
                            <Link to="/about">About</Link>
                        </Menu.Item>
                        <Menu.Item key="projects">
                            <Link to="/project">Projects</Link>
                        </Menu.Item>
                        <Menu.Item key="apply">
                            <Link to="/apply">Apply</Link>
                        </Menu.Item>
                    </SubMenu> */}
                </Menu>
            }
        </Layout.Header>
    );
}

export default Navbar;
