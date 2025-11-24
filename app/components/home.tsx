"use client"; // 标记这是一个客户端组件，只能在浏览器端渲染

require("../polyfill"); // 引入polyfill以确保兼容性

import { useEffect, useState } from "react"; // 导入React钩子
import styles from "./home.module.scss"; // 导入组件样式

import BotIcon from "../icons/bot.svg"; // 导入机器人图标
import LoadingIcon from "../icons/three-dots.svg"; // 导入加载图标

import { getCSSVar, useMobileScreen } from "../utils"; // 导入工具函数

import dynamic from "next/dynamic"; // 导入Next.js动态导入函数
import { Path, SlotID } from "../constant"; // 导入路径和插槽ID常量
import { ErrorBoundary } from "./error"; // 导入错误边界组件

import { getISOLang, getLang } from "../locales"; // 导入语言相关函数

import {
  HashRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom"; // 导入路由相关组件
import { SideBar } from "./sidebar"; // 导入侧边栏组件
import { useAppConfig } from "../store/config"; // 导入应用配置状态管理
import { AuthPage } from "./auth"; // 导入认证页面组件
import { getClientConfig } from "../config/client"; // 导入客户端配置
import { type ClientApi, getClientApi } from "../client/api"; // 导入API客户端类型和函数
import { useAccessStore } from "../store"; // 导入访问权限状态管理
import clsx from "clsx"; // 导入类名处理工具
import { initializeMcpSystem, isMcpEnabled } from "../mcp/actions"; // 导入MCP(可能是某种服务)相关动作

/**
 * 加载组件 - 显示加载状态的UI
 * @param props 组件属性
 * @param props.noLogo 是否显示机器人图标，默认为false（显示图标）
 */
export function Loading(props: { noLogo?: boolean }) {
  return (
    <div className={clsx("no-dark", styles["loading-content"])}>
      {/* 根据noLogo属性决定是否显示机器人图标 */}
      {!props.noLogo && <BotIcon />}
      <LoadingIcon />
    </div>
  );
}

// 动态导入各个页面组件，实现懒加载以提升性能
// Artifacts组件 - 可能用于展示AI生成的内容或产物
const Artifacts = dynamic(async () => (await import("./artifacts")).Artifacts, {
  loading: () => <Loading noLogo />, // 加载时显示无图标加载状态
});

// Settings组件 - 应用设置页面
const Settings = dynamic(async () => (await import("./settings")).Settings, {
  loading: () => <Loading noLogo />,
});

// Chat组件 - 聊天界面
const Chat = dynamic(async () => (await import("./chat")).Chat, {
  loading: () => <Loading noLogo />,
});

// NewChat组件 - 创建新聊天的界面
const NewChat = dynamic(async () => (await import("./new-chat")).NewChat, {
  loading: () => <Loading noLogo />,
});

// MaskPage组件 - 可能是用于聊天面具/提示词模板管理
const MaskPage = dynamic(async () => (await import("./mask")).MaskPage, {
  loading: () => <Loading noLogo />,
});

// PluginPage组件 - 插件管理页面
const PluginPage = dynamic(async () => (await import("./plugin")).PluginPage, {
  loading: () => <Loading noLogo />,
});

// SearchChat组件 - 聊天历史搜索页面
const SearchChat = dynamic(
  async () => (await import("./search-chat")).SearchChatPage,
  {
    loading: () => <Loading noLogo />,
  },
);

// Sd组件 - 可能与Stable Diffusion相关的AI图像生成功能
const Sd = dynamic(async () => (await import("./sd")).Sd, {
  loading: () => <Loading noLogo />,
});

// McpMarketPage组件 - MCP市场页面（可能是模型、组件或插件市场）
const McpMarketPage = dynamic(
  async () => (await import("./mcp-market")).McpMarketPage,
  {
    loading: () => <Loading noLogo />,
  },
);

/**
 * 主题切换钩子 - 根据应用配置自动切换网站的明暗主题
 * 使用useEffect监听配置中的theme变化，并相应地更新DOM
 */
export function useSwitchTheme() {
  const config = useAppConfig(); // 获取应用配置状态

  useEffect(() => {
    // 首先移除所有主题类以确保没有冲突
    document.body.classList.remove("light");
    document.body.classList.remove("dark");

    // 根据配置添加对应的主题类
    if (config.theme === "dark") {
      document.body.classList.add("dark");
    } else if (config.theme === "light") {
      document.body.classList.add("light");
    }

    // 获取主题颜色相关的meta标签
    const metaDescriptionDark = document.querySelector(
      'meta[name="theme-color"][media*="dark"]',
    );
    const metaDescriptionLight = document.querySelector(
      'meta[name="theme-color"][media*="light"]',
    );

    // 根据主题配置设置meta标签的theme-color
    if (config.theme === "auto") {
      // 自动模式下使用默认的深色和浅色主题色
      metaDescriptionDark?.setAttribute("content", "#151515");
      metaDescriptionLight?.setAttribute("content", "#fafafa");
    } else {
      // 非自动模式下使用CSS变量中的主题色
      const themeColor = getCSSVar("--theme-color");
      metaDescriptionDark?.setAttribute("content", themeColor);
      metaDescriptionLight?.setAttribute("content", themeColor);
    }
  }, [config.theme]); // 依赖于theme配置项，当其变化时重新执行
}

/**
 * HTML语言设置钩子 - 确保HTML文档的lang属性与当前应用语言一致
 * 当组件挂载时，检查并更新html标签的lang属性
 */
function useHtmlLang() {
  useEffect(() => {
    // 获取当前应用语言的ISO代码（如'zh-CN', 'en-US'等）
    const lang = getISOLang();
    // 获取当前HTML文档已设置的语言
    const htmlLang = document.documentElement.lang;

    // 如果两者不同，则更新HTML文档的语言设置
    if (lang !== htmlLang) {
      document.documentElement.lang = lang;
    }
  }, []); // 空依赖数组，表示只在组件挂载时执行一次
}

/**
 * 客户端水合状态钩子 - 用于检测React是否已完成客户端水合(hydration)
 * 在服务端渲染应用中，此钩子可用于区分SSR期间和客户端完全加载后的状态
 */
const useHasHydrated = () => {
  // 初始化状态为false，表示尚未完成水合
  const [hasHydrated, setHasHydrated] = useState<boolean>(false);

  // 在客户端渲染完成后设置为true
  useEffect(() => {
    setHasHydrated(true);
  }, []);

  // 返回水合状态
  return hasHydrated;
};

/**
 * 异步加载Google字体 - 根据构建模式选择适当的字体加载路径
 * 使用代理或直接从Google Fonts加载字体文件
 */
const loadAsyncGoogleFont = () => {
  // 创建link元素
  const linkEl = document.createElement("link");
  // 本地代理字体路径
  const proxyFontUrl = "/google-fonts";
  // 远程Google字体CDN路径
  const remoteFontUrl = "https://fonts.googleapis.com";
  // 根据构建模式决定使用哪个路径
  const googleFontUrl =
    getClientConfig()?.buildMode === "export" ? remoteFontUrl : proxyFontUrl;
  // 设置link元素属性
  linkEl.rel = "stylesheet";
  linkEl.href =
    googleFontUrl +
    "/css2?family=" +
    encodeURIComponent("Noto Sans:wght@300;400;700;900") +
    "&display=swap";
  // 将link元素添加到文档头部
  document.head.appendChild(linkEl);
};

/**
 * 窗口内容容器组件 - 为应用主要内容区域提供统一的样式和结构
 * @param props 组件属性
 * @param props.children 要渲染的内容组件
 */
export function WindowContent(props: { children: React.ReactNode }) {
  return (
    <div className={styles["window-content"]} id={SlotID.AppBody}>
      {props?.children}
    </div>
  );
}

/**
 * 屏幕布局组件 - 处理应用的整体布局和路由管理
 * 管理侧边栏显示、响应式布局和各页面路由配置
 */
function Screen() {
  // 获取应用配置
  const config = useAppConfig();
  // 获取当前路由位置信息
  const location = useLocation();

  // 判断当前是否为特定页面，用于决定显示不同布局
  const isArtifact = location.pathname.includes(Path.Artifacts); // 产物详情页
  const isHome = location.pathname === Path.Home; // 首页
  const isAuth = location.pathname === Path.Auth; // 认证页
  const isSd = location.pathname === Path.Sd; // 图像生成页
  const isSdNew = location.pathname === Path.SdNew; // 新建图像页

  // 检查是否为移动设备
  const isMobileScreen = useMobileScreen();
  // 决定是否使用紧凑边框模式
  const shouldTightBorder =
    getClientConfig()?.isApp || (config.tightBorder && !isMobileScreen);

  // 组件挂载时加载Google字体
  useEffect(() => {
    loadAsyncGoogleFont();
  }, []);

  // 特殊页面处理：产物详情页使用单独的路由配置
  if (isArtifact) {
    return (
      <Routes>
        <Route path="/artifacts/:id" element={<Artifacts />} />
      </Routes>
    );
  }

  // 渲染内容的函数 - 根据不同页面路由决定显示内容
  const renderContent = () => {
    // 认证页面特殊处理，不显示侧边栏
    if (isAuth) return <AuthPage />;
    // 图像生成相关页面
    if (isSd) return <Sd />;
    if (isSdNew) return <Sd />;

    // 标准布局：侧边栏 + 内容区域
    return (
      <>
        <SideBar
          className={clsx({
            [styles["sidebar-show"]]: isHome, // 仅在首页时显示侧边栏
          })}
        />
        <WindowContent>
          <Routes>
            {/* 定义应用的所有路由路径和对应的组件 */}
            <Route path={Path.Home} element={<Chat />} />
            <Route path={Path.NewChat} element={<NewChat />} />
            <Route path={Path.Masks} element={<MaskPage />} />
            <Route path={Path.Plugins} element={<PluginPage />} />
            <Route path={Path.SearchChat} element={<SearchChat />} />
            <Route path={Path.Chat} element={<Chat />} />
            <Route path={Path.Settings} element={<Settings />} />
            <Route path={Path.McpMarket} element={<McpMarketPage />} />
          </Routes>
        </WindowContent>
      </>
    );
  };

  // 返回整个屏幕容器，根据不同条件应用不同的CSS类
  return (
    <div
      className={clsx(styles.container, {
        [styles["tight-container"]]: shouldTightBorder, // 紧凑模式边框
        [styles["rtl-screen"]]: getLang() === "ar", // 阿拉伯语等RTL语言特殊处理
      })}
    >
      {renderContent()}
    </div>
  );
}

/**
 * 数据加载钩子 - 初始化应用数据，从API获取模型信息
 * 在组件挂载时异步加载可用的AI模型列表并更新到应用配置中
 */
export function useLoadData() {
  const config = useAppConfig(); // 获取应用配置

  // 根据当前配置的提供者名称获取对应的API客户端
  const api: ClientApi = getClientApi(config.modelConfig.providerName);

  useEffect(() => {
    // 异步函数获取模型列表
    (async () => {
      const models = await api.llm.models(); // 调用API获取模型列表
      config.mergeModels(models); // 将获取到的模型合并到配置中
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 空依赖数组，仅在组件挂载时执行一次
}

/**
 * 主应用组件 - 应用的根组件，负责初始化各种功能并提供路由
 * 集成了主题切换、数据加载、语言设置和错误边界等功能
 */
export function Home() {
  // 应用初始化钩子调用
  useSwitchTheme(); // 设置主题
  useLoadData(); // 加载数据
  useHtmlLang(); // 设置HTML语言

  useEffect(() => {
    // 打印构建时配置信息用于调试
    console.log("[Config] got config from build time", getClientConfig());
    // 加载访问权限状态
    useAccessStore.getState().fetch();

    // 初始化MCP系统的异步函数
    const initMcp = async () => {
      try {
        // 检查MCP是否启用
        const enabled = await isMcpEnabled();
        if (enabled) {
          console.log("[MCP] initializing...");
          await initializeMcpSystem(); // 初始化MCP系统
          console.log("[MCP] initialized");
        }
      } catch (err) {
        console.error("[MCP] failed to initialize:", err); // 记录初始化失败错误
      }
    };

    // 调用MCP初始化函数
    initMcp();
  }, []); // 空依赖数组，仅在组件挂载时执行一次

  // 在客户端水合完成前显示加载状态
  if (!useHasHydrated()) {
    return <Loading />;
  }

  // 主应用结构：错误边界包裹路由
  return (
    <ErrorBoundary>
      {" "}
      {/* 错误边界捕获子组件错误 */}
      <Router>
        {" "}
        {/* 哈希路由 */}
        <Screen /> {/* 屏幕布局组件 */}
      </Router>
    </ErrorBoundary>
  );
}
