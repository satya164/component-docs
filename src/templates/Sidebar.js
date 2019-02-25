/* @flow */

import * as React from 'react';
import { css, cx } from 'linaria';
import Link from './Link';
import type { Metadata, Separator } from '../types';

const TEXT_COLOR = '#888';
const TEXT_HOVER_COLOR = '#111';
const TEXT_ACTIVE_COLOR = '#397AF9';

const sidebar = css`
  background-color: #f8f9fa;

  @media (min-width: 640px) {
    height: 100%;
    min-width: 240px;
    overflow: auto;
    -webkit-overflow-scrolling: touch;
  }
`;

const navigation = css`
  padding: 12px 24px;

  @media (min-width: 640px) {
    padding: 20px 32px;
  }
`;

const searchbar = css`
  appearance: none;
  width: calc(100% - 48px);
  padding: 8px 12px;
  margin: 32px 24px 0;
  font-size: 1em;
  background-color: rgba(0, 0, 55, 0.08);
  transition: background-color 0.3s;
  border-radius: 3px;
  border: 0;
  outline: 0;

  &:focus {
    background-color: rgba(0, 0, 55, 0.12);
  }

  @media (min-width: 640px) {
    width: calc(100% - 64px);
    margin: 32px 32px 0;
  }
`;

const menu = css`
  position: fixed;
  opacity: 0;
  pointer-events: none;

  @media (min-width: 640px) {
    position: relative;
    opacity: 1;
    pointer-events: auto;
  }

  @media (max-width: 639px) {
    .${searchbar}:first-child {
      margin-top: 72px;
    }
  }
`;

const menuIcon = css`
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  position: absolute;
  top: 0;
  right: 0;
  padding: 30px;
  z-index: 10;
  -webkit-tap-highlight-color: transparent;

  @media (min-width: 640px) {
    display: none;
  }
`;

const menuButton = css`
  display: none;

  &:checked ~ .${menu} {
    position: relative;
    opacity: 1;
    pointer-events: auto;
  }

  &:checked ~ label {
    color: #111;
    user-select: none;
  }
`;

const logoImage = css`
  display: block;
  height: 48px;
  width: auto;
  margin: 32px 32px 0;
`;

const separator = css`
  border: 0;
  background-color: rgba(0, 0, 0, 0.04);
  height: 1px;
  margin: 20px 0;
`;

const link = css`
  display: block;
  padding: 12px 0;
  text-decoration: none;
  color: ${TEXT_COLOR};
  line-height: 1;

  &:hover {
    color: ${TEXT_HOVER_COLOR};
  }
`;

const active = css`
  color: ${TEXT_ACTIVE_COLOR};

  &:hover {
    color: ${TEXT_ACTIVE_COLOR};
  }
`;

const row = css`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  .${link} {
    flex: 1;
  }
`;

const groupItems = css`
  position: relative;
  padding-left: 12px;
  transition: 0.3s;

  &:before {
    content: '';
    display: block;
    position: absolute;
    background-color: rgba(0, 0, 0, 0.04);
    width: 1px;
    top: 0;
    bottom: 0;
    left: 0;
    margin: 12px 0;
  }
`;

const groupItemsVisible = css`
  opacity: 1;
`;

const groupItemsHidden = css`
  opacity: 0;
  pointer-events: none;
`;

const buttonIcon = css`
  background-color: transparent;
  border: none;
  color: #aaa;
  cursor: pointer;
  margin: 0;
  padding: 10px 12px;
  transition: 0.3s;
  opacity: 0.8;

  &:hover {
    color: #555;
  }

  &:focus {
    outline: none;
  }
`;

const expandedIcon = css`
  transform: rotate(0deg);
`;

const collapsedIcon = css`
  transform: rotate(-180deg);
`;

type Props = {
  logo?: string,
  path: string,
  data: Array<Metadata | Separator>,
};

type State = {
  query: string,
  open: boolean,
  expanded: {
    [key: string]: { height: ?number, expanded: boolean },
  },
};

export default class Sidebar extends React.Component<Props, State> {
  state = {
    query: '',
    open: false,
    expanded: this.props.data.reduce((acc, item) => {
      if (item.type === 'separator') {
        return acc;
      }

      if (item.group) {
        const group = acc[item.group];

        if (!group) {
          acc[item.group] = {
            height: null,
            expanded: true,
          };
        }
      }

      return acc;
    }, {}),
  };

  componentDidMount() {
    setTimeout(() => this._measureHeights(), 1000);
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.data !== this.props.data) {
      this._measureHeights();
    }
  }

  _measureHeights = () =>
    this.setState({
      expanded: this.props.data.reduce((acc, item) => {
        if (item.type === 'separator') {
          return acc;
        }

        if (item.group) {
          const group = acc[item.group];

          const height = this._items[item.group]
            ? this._items[item.group].clientHeight
            : null;

          if (!group) {
            acc[item.group] = {
              height,
              expanded: true,
            };
          }
        }

        return acc;
      }, {}),
    });

  _items: { [key: string]: ?HTMLDivElement } = {};

  render() {
    const { path, data, logo } = this.props;
    const mapper = (item, i) => {
      if (item.type === 'separator') {
        return <hr key={`separator-${i + 1}`} className={separator} />;
      }

      if (item.type === 'group') {
        const groupItem = this.state.expanded[item.title] || {
          height: null,
          expanded: true,
        };

        return (
          <div key={item.link || item.title + i}>
            <div className={row}>
              <Link
                to={item.link}
                className={cx(link, path === item.link && active)}
                onClick={() =>
                  this.setState(state => {
                    const group = state.expanded[item.title];

                    return {
                      expanded: {
                        ...state.expanded,
                        [item.title]: {
                          ...group,
                          expanded:
                            path === item.link || !item.link
                              ? !group.expanded
                              : group.expanded,
                        },
                      },
                      open: path === item.link ? state.open : false,
                      query: '',
                    };
                  })
                }
              >
                {item.title}
              </Link>
              <button
                className={cx(
                  buttonIcon,
                  groupItem.expanded ? expandedIcon : collapsedIcon
                )}
                style={{
                  opacity: typeof groupItem.height === 'number' ? 1 : 0,
                }}
                onClick={() =>
                  this.setState(state => {
                    const group = state.expanded[item.title];

                    return {
                      expanded: {
                        ...state.expanded,
                        [item.title]: {
                          ...group,
                          expanded: !group.expanded,
                        },
                      },
                    };
                  })
                }
              >
                <svg width="16px" height="16px" viewBox="0 0 16 16">
                  <polygon
                    stroke="none"
                    strokeWidth="1"
                    fillRule="evenodd"
                    fill="currentColor"
                    points="8 4 2 10 3.4 11.4 8 6.8 12.6 11.4 14 10"
                  />
                </svg>
              </button>
            </div>
            <div
              ref={container => {
                this._items[item.title] = container;
              }}
              className={cx(
                groupItems,
                groupItem.expanded ? groupItemsVisible : groupItemsHidden
              )}
              style={
                typeof groupItem.height === 'number'
                  ? {
                      height: `${groupItem.expanded ? groupItem.height : 0}px`,
                    }
                  : null
              }
            >
              {item.items.map(mapper)}
            </div>
          </div>
        );
      }

      return (
        <Link
          key={item.link}
          to={item.link}
          className={cx(link, path === item.link && active)}
          onClick={() => this.setState({ open: false, query: '' })}
        >
          {item.title}
        </Link>
      );
    };

    let items;

    if (this.state.query) {
      items = data.filter(item => {
        if (item.type === 'separator') {
          return false;
        }

        return item.title
          .toLowerCase()
          .includes(this.state.query.toLowerCase());
      });
    } else {
      // Find all groups names in our data and create a list of groups
      const groups = data
        .filter((item: any) => Boolean(item.group))
        .map((item: any): string => item.group)
        .filter((item, i, self) => self.lastIndexOf(item) === i)
        .reduce(
          (acc, title: string) =>
            Object.assign(acc, {
              [title]: {
                type: 'group',
                items: [],
                title,
              },
            }),
          {}
        );

      // Find items belonging to groups and add them to the groups
      items = data.reduce((acc, item) => {
        if (item.type === 'separator') {
          acc.push(item);
        } else if (item.title in groups) {
          // If the title of the item matches a group, replace the item with the group
          const group = groups[item.title];

          acc.push({ ...group, link: item.link });
        } else if (item.group) {
          // If the item belongs to a group, find an item matching the group first
          /* $FlowFixMe */
          const index = acc.findIndex(it => it.title === item.group);

          let group = acc[index];

          if (group) {
            if (group.type !== 'group') {
              // If the item exists, but is not a group, turn it a to a group first
              /* $FlowFixMe */
              group = { ...groups[item.group], link: item.link };

              acc[index] = group;
            } else {
              // If the group exists, add our item
              group.items.push(item);
            }
          } else {
            // If the item doesn't exist at all, add a new group to the list
            /* $FlowFixMe */
            group = groups[item.group];

            group.items.push(item);
            acc.push(group);
          }
        } else {
          acc.push(item);
        }

        return acc;
      }, []);
    }

    const links = items.map(mapper);

    return (
      <aside className={sidebar}>
        <input
          className={menuButton}
          id="slide-sidebar"
          type="checkbox"
          role="button"
          checked={this.state.open}
          onChange={e => this.setState({ open: e.target.checked })}
        />
        <label className={menuIcon} htmlFor="slide-sidebar">
          ☰
        </label>
        <div className={menu}>
          {logo ? <img className={logoImage} src={logo} alt="Logo" /> : null}
          <input
            type="search"
            value={this.state.query}
            onChange={e => this.setState({ query: e.target.value })}
            placeholder="Filter…"
            className={searchbar}
          />
          <nav className={navigation}>{links}</nav>
        </div>
      </aside>
    );
  }
}
