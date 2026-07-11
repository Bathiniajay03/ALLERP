import React, { useCallback, useEffect, useMemo, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from "react-router-dom";

// Form Imports
import Dashboard from "./forms/Dashboard";
import Products from "./forms/Products";
import Operations from "./forms/Operations";
import CreateSalesOrder from "./forms/CreateSalesOrder";
import Warehouses from "./forms/Warehouses";
import Reports from "./forms/Reports";
import Automation from "./forms/Automation";
import PurchaseOrders from "./forms/PurchaseOrders";
import AdminPanel from "./forms/AdminPanel";
import VendorReturns from "./forms/VendorReturns";
import Inventory from "./forms/Inventory";
import Finance from "./forms/Finance";
import Lots from "./forms/Lots";
import Customers from "./forms/Customers";
import Notifications from "./forms/Notifications";
import LocalAIPage from "./pages/LocalAIPage";
import SalesOrderList from "./forms/SalesOrderList";
import OrderManagement from "./forms/OrderManagement";
import Vendors from "./forms/Vendors";
import StockAlerts from "./forms/StockAlerts";
import ScannerDevicePage from "./pages/ScannerDevicePage";
import SerialScanPage from "./pages/SerialScanPage";
import SystemSettings from "./forms/SystemSettings";
import ClientSettings from "./forms/ClientSettings";

// SaaS Tenant Modules
import CompanyDashboard from "./forms/CompanyDashboard";
import CompanySettings from "./forms/CompanySettings";
import SubscriptionPage from "./forms/SubscriptionPage";
import UsageAnalytics from "./forms/UsageAnalytics";

// Super Admin Portal
import SuperAdminPortal from "./forms/SuperAdminPortal";

import LandingPage from "./pages/LandingPage";
import SignupWizard from "./pages/SignupWizard";
import RegistrationSuccess from "./pages/RegistrationSuccess";
import CompanyLoginPage from "./pages/CompanyLoginPage";

import WmsSetup from "./forms/WmsSetup";
import WmsDashboard from "./forms/WmsDashboard";
import WmsOperations from "./forms/WmsOperations";
import BarcodeDashboard from "./forms/BarcodeDashboard";
import WmsBarcodeLabels from "./forms/WmsBarcodeLabels";
import WmsScannerApp from "./forms/WmsScannerApp";
import WmsPackageScreen from "./forms/WmsPackageScreen";
import BarcodeGenerator from "./forms/BarcodeGenerator";
import BarcodeHub from "./forms/BarcodeHub";
import BarcodeSettings from "./forms/BarcodeSettings";
import WarehouseBarcodePage from "./forms/WarehouseBarcodePage";
import ZoneBarcodePage from "./forms/ZoneBarcodePage";
import AisleBarcodePage from "./forms/AisleBarcodePage";
import RackBarcodePage from "./forms/RackBarcodePage";
import ShelfBarcodePage from "./forms/ShelfBarcodePage";
import BinBarcodePage from "./forms/BinBarcodePage";
import ItemBarcodePage from "./forms/ItemBarcodePage";
import LotBarcodePage from "./forms/LotBarcodePage";
import SerialBarcodePage from "./forms/SerialBarcodePage";
import PurchaseOrderBarcodePage from "./forms/PurchaseOrderBarcodePage";
import SalesOrderBarcodePage from "./forms/SalesOrderBarcodePage";
import ShipmentBarcodePage from "./forms/ShipmentBarcodePage";
import PickListBarcodePage from "./forms/PickListBarcodePage";

import { LocalAIProvider } from "./context/LocalAIContext";
import { smartErpApi } from "./services/smartErpApi";

// 1. Grouped Module Configuration
const ROLE_MODULES_VERSION = 4;
const ROLE_MODULES_KEY = "erp_role_modules";
const ROLE_MODULES_VERSION_KEY = "erp_role_modules_version";

const MODULE_CONFIG = [
  { id: "dashboard", label: "Dashboard", path: "/dashboard" },
  { id: "products", label: "Products", path: "/products" },

  {
    id: "salesGroup",
    label: "Sales & CRM",
    isGroup: true,
    subModules: [
      { id: "orderManagement", label: "Order Management", path: "/order-management" },
      { id: "salesOrderList", label: "Sales Orders", path: "/sales-orders/list" },
      { id: "createSalesOrder", label: "Create Order", path: "/sales-orders/create" },
      { id: "customers", label: "Customers", path: "/customers" },
    ]
  },
  {
    id: "vendorGroup",
    label: "Vendor Portal",
    isGroup: true,
    subModules: [
      { id: "vendors", label: "Vendors", path: "/vendors" },
      { id: "purchaseOrders", label: "Purchase Orders", path: "/purchase-orders" },
      { id: "vendorReturns", label: "Returns", path: "/vendor-returns" },
    ]
  },
  {
    id: "inventoryGroup",
    label: "Warehouse & Lots",
    isGroup: true,
    subModules: [
      { id: "inventory", label: "Stock Inventory", path: "/inventory" },
      { id: "lots", label: "Lot Tracking", path: "/lots" },
      { id: "warehouses", label: "Warehouses", path: "/warehouses" },
      { id: "operations", label: "Order Flow", path: "/operations" },
    ]
  },
  {
    id: "financeGroup",
    label: "Finance & Data",
    isGroup: true,
    subModules: [
      { id: "finance", label: "Finance & Payments", path: "/finance" },
      { id: "reports", label: "Reports", path: "/reports" },
      { id: "stockAlerts", label: "Stock Alerts", path: "/stock-alerts" },
    ]
  },
  {
    id: "wmsGroup",
    label: "Enterprise WMS",
    isGroup: true,
    subModules: [
      { id: "wmsDashboard", label: "WMS Dashboard", path: "/wms/dashboard" },
      { id: "wmsSetup", label: "WMS Topology Map", path: "/wms/setup" },
      { id: "wmsOperations", label: "WMS Operations", path: "/wms/operations" },
      { id: "barcodeDashboard", label: "Barcode Dashboard", path: "/wms/barcode-dashboard" },
      { id: "wmsBarcodeLabels", label: "Barcode Labels", path: "/wms/barcode-labels" },
      { id: "barcodeGenerator", label: "Barcode Generator", path: "/wms/barcode-generator" },
      { id: "barcodeScanner", label: "Barcode Hub", path: "/wms/barcode-hub" },
      // { id: "barcodeSearch", label: "Barcode Search", path: "/wms/barcode-hub" },
      // { id: "barcodeDetails", label: "Barcode Details", path: "/wms/barcode-hub" },
      { id: "barcodeSettings", label: "Barcode Settings", path: "/wms/barcode-settings" },
    ]
  },
  {
    id: "scannerGroup",
    label: "Scanner Hub",
    isGroup: true,
    subModules: [
      { id: "scannerDevice", label: "Mobile Scanner", path: "/scanner-device" },
      { id: "serialScan", label: "Serial Scan", path: "/serial-scan" },
      { id: "wmsScannerApp", label: "Enterprise Scanner", path: "/scanner-app" },
      { id: "wmsPackageScreen", label: "Package Dispatch", path: "/package-dispatch" },
    ]
  },
  { id: "automation", label: "Automation", path: "/automation" },
  { id: "localAI", label: "Local AI", path: "/local-ai" },
  { id: "notifications", label: "Notifications", path: "/notifications" },
  { id: "admin", label: "Admin", path: "/admin" },
  { id: "systemSettings", label: "System Settings", path: "/system-settings" },
  { id: "clientSettings", label: "Tenant Settings", path: "/tenant-settings" },

  // SaaS Tenant Modules
  {
    id: "companyGroup",
    label: "My Company",
    isGroup: true,
    subModules: [
      { id: "companyDashboard", label: "Company Dashboard", path: "/company/dashboard" },
      { id: "companySettings", label: "Company Settings", path: "/company/settings" },
      { id: "subscriptionPage", label: "Subscription", path: "/company/subscription" },
      { id: "usageAnalytics", label: "Usage Analytics", path: "/company/usage" },
    ]
  },

  // Super Admin Module
  { id: "superAdmin", label: "⚡ Super Admin", path: "/super-admin" }
];

const COMPANY_MODULES = ["companyDashboard", "companySettings", "subscriptionPage", "usageAnalytics"];

const DEFAULT_ROLE_MODULES = {
  Admin: [...MODULE_CONFIG.flatMap((module) => module.isGroup ? module.subModules.map((subModule) => subModule.id) : [module.id])],
  Manager: [
    "dashboard", "products", "orderManagement", "salesOrderList", "createSalesOrder", "customers", "vendors",
    "purchaseOrders", "vendorReturns", "inventory", "lots", "warehouses", "operations", "finance", "reports",
    "stockAlerts", "scannerDevice", "serialScan", "automation", "notifications", "wmsDashboard", "wmsSetup", "wmsOperations", "barcodeDashboard", "wmsBarcodeLabels", "barcodeGenerator", "barcodeScanner", "barcodeSearch", "barcodeDetails", "barcodeSettings", "wmsScannerApp", "wmsPackageScreen", ...COMPANY_MODULES
  ],
  Operator: ["operations", "scannerDevice", "serialScan", "wmsOperations"],
  OperationsWorker: [
    "dashboard", "products", "inventory", "operations", "salesOrderList", "createSalesOrder", "customers",
    "vendors", "purchaseOrders", "vendorReturns", "finance", "stockAlerts", "notifications", "scannerDevice", "serialScan"
  ],
  ScannerWorker: ["scannerDevice", "serialScan", "operations", "wmsScannerApp"],
  "Warehouse Manager": [
    "dashboard", "products", "inventory", "lots", "warehouses", "operations", "purchaseOrders", "vendors",
    "vendorReturns", "finance", "stockAlerts", "notifications", "scannerDevice", "serialScan", "wmsDashboard", "wmsSetup", "wmsOperations", "barcodeDashboard", "wmsBarcodeLabels", "barcodeGenerator", "barcodeScanner", "barcodeSearch", "barcodeDetails", "barcodeSettings", "wmsScannerApp", "wmsPackageScreen"
  ],
  "Finance Manager": [
    "dashboard", "finance", "reports", "salesOrderList", "purchaseOrders", "customers", "vendors",
    "vendorReturns", "stockAlerts", "notifications"
  ],
  "Robot Supervisor": ["dashboard", "operations", "automation", "localAI", "notifications", "scannerDevice"],
  User: ["dashboard", "notifications"]
};

export default function App() {
  return (
    <LocalAIProvider>
      <Router>
        <style>{`
          :root {
            --brand-color: #38bdf8;
            --sidebar-bg: #0f172a;
            --sidebar-color: #f8fafc;
            --sidebar-border: #1e293b;
          }
          body { margin: 0; padding: 0; background: #f1f5f9; overflow-x: hidden; font-family: 'Inter', sans-serif; }
          .erp-container { display: flex; min-height: 100vh; }
          .sidebar-wrapper {
            width: 260px; background: var(--sidebar-bg); color: var(--sidebar-color);
            display: flex; flex-direction: column; position: fixed;
            height: 100vh; left: 0; top: 0; z-index: 2000;
            transition: transform 0.3s ease;
          }
          .sidebar-brand { padding: 25px 20px; border-bottom: 1px solid var(--sidebar-border); }
          .sidebar-brand h3 { color: var(--brand-color); font-weight: 800; margin: 0; font-size: 1.1rem; }
          .sidebar-nav-container { flex-grow: 1; overflow-y: auto; padding: 15px 10px; }
          .nav-group-header, .main-link {
            padding: 10px 15px; color: var(--sidebar-color); opacity: 0.85; cursor: pointer; display: flex;
            justify-content: space-between; align-items: center; border-radius: 8px;
            text-decoration: none; font-size: 0.9rem; margin-bottom: 2px;
          }
          .main-link.active, .nav-group-header.active { background: rgba(255,255,255,0.15); color: #ffffff; opacity: 1; }
          .sidebar-submenu { padding-left: 10px; margin-top: 5px; border-left: 1px solid var(--sidebar-border); margin-left: 20px; }
          .submenu-link { display: block; padding: 6px 15px; color: var(--sidebar-color); opacity: 0.75; font-size: 0.85rem; text-decoration: none; }
          .submenu-link.active { color: var(--brand-color); font-weight: bold; opacity: 1; }
          .sidebar-footer { padding: 15px; border-top: 1px solid var(--sidebar-border); background: var(--sidebar-bg); }
          .erp-main-content { margin-left: 260px; flex-grow: 1; padding: 20px; width: 100%; transition: 0.3s; }
          .login-page {
            width: 100vw; height: 100vh;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            display: flex; align-items: center; justify-content: center;
            position: fixed; top: 0; left: 0; z-index: 5000;
          }
          .login-card {
            background: #ffffff; padding: 40px; border-radius: 16px;
            width: 100%; max-width: 420px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          }
          .login-brand { color: #0f172a; font-weight: 800; font-size: 1.5rem; text-align: center; margin-bottom: 10px; letter-spacing: -0.5px; }
          .login-title { font-size: 1.1rem; color: #475569; text-align: center; font-weight: 600; margin-bottom: 8px; }
          .login-subtitle { font-size: 0.85rem; color: #64748b; text-align: center; margin-bottom: 30px; }
          .form-label { font-weight: 600; color: #334155; font-size: 0.85rem; }
          .form-control { padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 0.95rem; background: #f8fafc; }
          .form-control:focus { background: #fff; border-color: #38bdf8; box-shadow: 0 0 0 4px rgba(56, 189, 248, 0.1); }
          .btn-primary { background: #38bdf8; border: none; padding: 12px; font-weight: 700; border-radius: 8px; transition: 0.2s; }
          .btn-primary:hover { background: #0ea5e9; transform: translateY(-1px); }
          .mobile-header { display: none; background: #ffffff; padding: 12px 20px; border-bottom: 1px solid #e2e8f0; position: sticky; top: 0; z-index: 1500; justify-content: space-between; align-items: center; }
          @media (max-width: 992px) {
            .sidebar-wrapper { transform: translateX(-260px); }
            .sidebar-wrapper.mobile-open { transform: translateX(0); }
            .erp-main-content { margin-left: 0; }
            .mobile-header { display: flex; }
            .sidebar-backdrop { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1900; }
          }
        `}</style>
        <AppContent />
      </Router>
    </LocalAIProvider>
  );
}

function AppContent() {
  const isClient = typeof window !== "undefined";

  // 1. UPDATED: Initialize authentication state directly from storage to prevent Dashboard flicker
  const [isAuthenticated, setIsAuthenticated] = useState(() => (isClient ? !!window.localStorage.getItem("erp_token") : false));
  const [authToken, setAuthToken] = useState(() => (isClient ? window.localStorage.getItem("erp_token") || "" : ""));
  const [role, setRole] = useState(() => (isClient ? window.localStorage.getItem("erp_role") || "" : ""));
  const [userType, setUserType] = useState(() => (isClient ? window.localStorage.getItem("erp_user_type") || "" : ""));
  const [userAssignedPages, setUserAssignedPages] = useState(() => {
    if (!isClient) return [];
    try {
      return JSON.parse(window.localStorage.getItem("erp_assigned_pages") || "[]");
    } catch { return []; }
  });
  const [companyBrand, setCompanyBrand] = useState(() => {
    if (!isClient) return {};
    try { return JSON.parse(window.localStorage.getItem("erp_company_brand") || "{}"); } catch { return {}; }
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // --- Utility Functions ---
  const normalizeRoleModules = useCallback((modules) => {
    const normalized = { ...modules };
    Object.entries(DEFAULT_ROLE_MODULES).forEach(([roleName, defaults]) => {
      const existing = normalized[roleName] ?? [];
      normalized[roleName] = Array.from(new Set([...existing, ...defaults]));
    });
    return normalized;
  }, []);

  const initialRoleModules = useCallback(() => {
    if (!isClient) return DEFAULT_ROLE_MODULES;
    const storedText = window.localStorage.getItem(ROLE_MODULES_KEY);
    const storedVersion = Number(window.localStorage.getItem(ROLE_MODULES_VERSION_KEY) ?? "0");
    const raw = storedText ? JSON.parse(storedText) : DEFAULT_ROLE_MODULES;
    const normalized = normalizeRoleModules(raw);
    if (storedVersion < ROLE_MODULES_VERSION || storedText !== JSON.stringify(normalized)) {
      window.localStorage.setItem(ROLE_MODULES_KEY, JSON.stringify(normalized));
      window.localStorage.setItem(ROLE_MODULES_VERSION_KEY, String(ROLE_MODULES_VERSION));
    }
    return normalized;
  }, [isClient, normalizeRoleModules]);

  const [authError, setAuthError] = useState("");
  const [allowedModulesByRole, setAllowedModulesByRole] = useState(initialRoleModules);

  const [companyFeatures, setCompanyFeatures] = useState(() => {
    const cached = window.localStorage.getItem("erp_company_features");
    return cached ? JSON.parse(cached) : {
      enableFinance: true,
      enableAI: true,
      enableReports: true,
      enableWarehouse: true,
      enableAutomation: true,
      enableScanner: true,
      enablePurchaseOrders: true,
      enableSales: true
    };
  });

  const persistRoleModules = useCallback((modules) => {
    const normalized = normalizeRoleModules(modules);
    if (isClient) {
      window.localStorage.setItem(ROLE_MODULES_KEY, JSON.stringify(normalized));
      window.localStorage.setItem(ROLE_MODULES_VERSION_KEY, String(ROLE_MODULES_VERSION));
    }
    setAllowedModulesByRole(normalized);
  }, [isClient, normalizeRoleModules]);

  const parseJwtPayload = useCallback((token) => {
    if (!token || typeof token !== "string") return {};
    try {
      const parts = token.split(".");
      if (parts.length < 2) return {};
      const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      return JSON.parse(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "=")));
    } catch { return {}; }
  }, []);

  const isAdminUser = useMemo(() => {
    const normalizedRole = String(role || "").trim().toLowerCase();
    const normalizedUserType = String(userType || "").trim().toUpperCase();
    const tokenPayload = parseJwtPayload(authToken);
    const tokenRole = String(tokenPayload.role || tokenPayload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || "").trim().toLowerCase();
    const tokenUserType = String(tokenPayload.userType || "").trim().toUpperCase();
    return normalizedRole === "admin" || normalizedUserType === "ADMIN" || tokenRole === "admin" || tokenUserType === "ADMIN";
  }, [authToken, parseJwtPayload, role, userType]);

  const isMainAdminUser = useMemo(() => {
    const normalizedUserType = String(userType || "").trim().toUpperCase();
    const tokenPayload = parseJwtPayload(authToken);
    const tokenUserType = String(tokenPayload.userType || "").trim().toUpperCase();
    return normalizedUserType === "ADMIN" || tokenUserType === "ADMIN" || normalizedUserType === "SUPERADMIN" || tokenUserType === "SUPERADMIN";
  }, [authToken, parseJwtPayload, userType]);

  const isSuperAdmin = useMemo(() => {
    const normalizedUserType = String(userType || "").trim().toUpperCase();
    const tokenPayload = parseJwtPayload(authToken);
    const tokenUserType = String(tokenPayload.userType || "").trim().toUpperCase();
    return normalizedUserType === "SUPERADMIN" || tokenUserType === "SUPERADMIN";
  }, [authToken, parseJwtPayload, userType]);

  // Apply dynamic branding from company
  useEffect(() => {
    if (companyBrand?.primaryColor) {
      document.documentElement.style.setProperty("--brand-color", companyBrand.primaryColor);
    }
    if (companyBrand?.companyName) {
      document.title = `${companyBrand.companyName} | ERP`;
    }
  }, [companyBrand]);

  // --- LOGOUT LOGIC ---
  const handleLogout = useCallback(async (message = "") => {
    if (message && typeof message === "string") {
      setAuthError(message);
    } else {
      setAuthError("");
    }
    const loginLogId = window.localStorage.getItem("erp_login_log_id");
    if (loginLogId) {
      try {
        await smartErpApi.logout({ loginLogId: Number(loginLogId) });
      } catch (error) { }
    }
    // Clear all local storage related to session
    window.localStorage.removeItem("erp_token");
    window.localStorage.removeItem("erp_role");
    window.localStorage.removeItem("erp_user_type");
    window.localStorage.removeItem("erp_assigned_pages");
    window.localStorage.removeItem("erp_login_log_id");
    window.localStorage.removeItem("erp_company_brand");
    window.localStorage.removeItem("erp_company_features");

    setIsAuthenticated(false);
    setAuthToken("");
    setRole("");
    setUserType("");
    setUserAssignedPages([]);
    setCompanyBrand({});
  }, []);

  // --- INACTIVITY TRACKER (Auto Logout) ---
  useEffect(() => {
    if (!isAuthenticated) return;

    let timeoutId;
    const INACTIVITY_LIMIT = 120 * 60 * 1000; // 120 Minutes

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        console.warn("Session expired due to inactivity.");
        handleLogout();
      }, INACTIVITY_LIMIT);
    };

    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
    events.forEach(event => window.addEventListener(event, resetTimer));

    resetTimer(); // Start timer initially

    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimer));
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isAuthenticated, handleLogout]);

  // --- Auth & Access Sync ---
  const handleLoginSuccess = useCallback(({ accessToken, role, loginLogId, userType, assignedPages, companyName, primaryColor, logo, companyCode }) => {
    window.localStorage.setItem("erp_token", accessToken);
    window.localStorage.setItem("erp_role", String(role).trim());
    window.localStorage.setItem("erp_user_type", String(userType).trim().toUpperCase());
    if (loginLogId) window.localStorage.setItem("erp_login_log_id", loginLogId.toString());
    window.localStorage.setItem("erp_assigned_pages", JSON.stringify(assignedPages || []));
    const brand = { companyName, primaryColor, logo, companyCode };
    window.localStorage.setItem("erp_company_brand", JSON.stringify(brand));

    setAuthToken(accessToken);
    setRole(role || "Admin");
    setUserType(userType || "");
    setUserAssignedPages(Array.isArray(assignedPages) ? assignedPages : []);
    setCompanyBrand(brand);
    setIsAuthenticated(true);
  }, []);

  const refreshCurrentAccess = useCallback(async () => {
    if (!window.localStorage.getItem("erp_token")) return;
    try {
      const res = await smartErpApi.getCurrentAccess();
      const access = res.data || {};
      if (access.role) {
        setRole(access.role);
        window.localStorage.setItem("erp_role", access.role);
      }
      if (access.userType) {
        setUserType(access.userType);
        window.localStorage.setItem("erp_user_type", access.userType);
      }
      const nextPages = Array.isArray(access.assignedPages) ? access.assignedPages : [];
      setUserAssignedPages(nextPages);
      window.localStorage.setItem("erp_assigned_pages", JSON.stringify(nextPages));

      if (access.companyName) {
        const brand = {
          companyName: access.companyName,
          primaryColor: access.primaryColor,
          logo: access.logo,
          companyCode: access.companyCode,
          sidebarBgColor: access.sidebarBgColor,
          sidebarTextColor: access.sidebarTextColor
        };
        window.localStorage.setItem("erp_company_brand", JSON.stringify(brand));
        setCompanyBrand(brand);

        const features = {
          enableFinance: access.enableFinance !== false,
          enableAI: access.enableAI !== false,
          enableReports: access.enableReports !== false,
          enableWarehouse: access.enableWarehouse !== false,
          enableAutomation: access.enableAutomation !== false,
          enableScanner: access.enableScanner !== false,
          enablePurchaseOrders: access.enablePurchaseOrders !== false,
          enableSales: access.enableSales !== false,
        };
        window.localStorage.setItem("erp_company_features", JSON.stringify(features));
        setCompanyFeatures(features);
      }
    } catch (error) {
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        handleLogout("Your company registry or user account has been deleted, suspended, or does not have access anymore.");
      }
    }
  }, [handleLogout]);

  useEffect(() => {
    if (!isAuthenticated) return;
    refreshCurrentAccess();
    const intervalId = window.setInterval(refreshCurrentAccess, 15000);
    return () => window.clearInterval(intervalId);
  }, [isAuthenticated, refreshCurrentAccess]);

  // --- Routing Logic ---
  const allModuleIds = useMemo(() => MODULE_CONFIG.flatMap(i => i.isGroup ? i.subModules.map(s => s.id) : [i.id]), []);
  const isModuleEnabledByCompany = useCallback((moduleId) => {
    if (isSuperAdmin) return true;
    switch (moduleId) {
      case "finance":
        return companyFeatures.enableFinance;
      case "localAI":
        return companyFeatures.enableAI;
      case "reports":
        return companyFeatures.enableReports;
      case "warehouses":
      case "inventory":
      case "lots":
        return companyFeatures.enableWarehouse;
      case "automation":
        return companyFeatures.enableAutomation;
      case "scannerDevice":
      case "serialScan":
        return companyFeatures.enableScanner;
      case "purchaseOrders":
      case "vendorReturns":
        return companyFeatures.enablePurchaseOrders;
      case "salesOrderList":
      case "createSalesOrder":
      case "customers":
      case "vendors":
        return companyFeatures.enableSales;
      default:
        return true;
    }
  }, [companyFeatures, isSuperAdmin]);

  const allowedIds = useMemo(() => {
    let baseAllowed = [];
    if (isSuperAdmin) {
      baseAllowed = [...allModuleIds, "superAdmin"];
    } else if (isAdminUser) {
      baseAllowed = [...allModuleIds.filter(id => id !== "superAdmin"), ...COMPANY_MODULES];
    } else if (userAssignedPages.length) {
      baseAllowed = userAssignedPages;
    } else {
      baseAllowed = allowedModulesByRole[role] || DEFAULT_ROLE_MODULES.Admin;
    }
    return baseAllowed.filter(id => isModuleEnabledByCompany(id));
  }, [allModuleIds, userAssignedPages, role, allowedModulesByRole, isAdminUser, isSuperAdmin, isModuleEnabledByCompany]);

  const fallbackPath = useMemo(() => {
    if (isSuperAdmin) return "/super-admin";
    const firstAllowed = MODULE_CONFIG.flatMap(i => i.isGroup ? i.subModules : [i]).find(i => allowedIds.includes(i.id));
    return firstAllowed?.path || "/dashboard";
  }, [allowedIds, isSuperAdmin]);

  const navItems = useMemo(() => {
    return MODULE_CONFIG
      .filter(item => {
        if (item.id === "systemSettings" && !isMainAdminUser) return false;
        if (item.id === "clientSettings" && isMainAdminUser) return false;
        if (item.id === "superAdmin" && !isSuperAdmin) return false;
        if (item.id === "companyGroup" && isSuperAdmin) return false;
        return item.isGroup ? item.subModules.some(s => allowedIds.includes(s.id)) : allowedIds.includes(item.id);
      })
      .map(item => item.isGroup ? { ...item, subModules: item.subModules.filter(s => allowedIds.includes(s.id)) } : item);
  }, [allowedIds, isMainAdminUser, isSuperAdmin]);

  const renderProtectedRoute = useCallback((moduleId, element) => allowedIds.includes(moduleId) ? element : <AccessDenied moduleId={moduleId} />, [allowedIds]);

  // 2. UPDATED: If not authenticated, show landing, custom login wizard, signup wizard, or success pages.
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<CompanyLoginPage onLoginSuccess={handleLoginSuccess} initialError={authError} />} />
        <Route path="/signup" element={<SignupWizard />} />
        <Route path="/signup/success" element={<RegistrationSuccess />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  const brandName = companyBrand?.companyName || "ERP PRO";
  const brandColor = companyBrand?.primaryColor || "#38bdf8";
  const brandLogo = companyBrand?.logo || null;
  const sidebarBgColor = companyBrand?.sidebarBgColor || "#0f172a";
  const sidebarTextColor = companyBrand?.sidebarTextColor || "#f8fafc";
  const sidebarBorderColor = sidebarBgColor === "#0f172a" ? "#1e293b" : "rgba(255, 255, 255, 0.1)";

  return (
    <div className="erp-container" style={{
      "--brand-color": brandColor,
      "--sidebar-bg": sidebarBgColor,
      "--sidebar-color": sidebarTextColor,
      "--sidebar-border": sidebarBorderColor
    }}>
      {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}
      <Sidebar
        navItems={navItems} role={role} isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)} onLogout={handleLogout}
        brandName={brandName} brandColor={brandColor} brandLogo={brandLogo}
        isSuperAdmin={isSuperAdmin}
      />

      <div className="erp-main-content">
        <header className="mobile-header">
          <button className="btn btn-dark btn-sm" onClick={() => setSidebarOpen(true)}>Menu</button>
          <span className="fw-bold">{brandName}</span>
          <div style={{ width: '45px' }}></div>
        </header>

        <Routes>
          <Route path="/" element={<Navigate to={fallbackPath} replace />} />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/signup" element={<Navigate to="/" replace />} />
          <Route path="/signup/success" element={<Navigate to="/" replace />} />
          <Route path="/dashboard" element={renderProtectedRoute("dashboard", <Dashboard />)} />
          <Route path="/products" element={renderProtectedRoute("products", <Products />)} />
          <Route path="/order-management" element={renderProtectedRoute("orderManagement", <OrderManagement />)} />
          <Route path="/sales-orders/list" element={renderProtectedRoute("salesOrderList", <SalesOrderList />)} />
          <Route path="/sales-orders/create" element={renderProtectedRoute("createSalesOrder", <CreateSalesOrder />)} />
          <Route path="/customers" element={renderProtectedRoute("customers", <Customers />)} />
          <Route path="/vendors" element={renderProtectedRoute("vendors", <Vendors />)} />
          <Route path="/purchase-orders" element={renderProtectedRoute("purchaseOrders", <PurchaseOrders />)} />
          <Route path="/vendor-returns" element={renderProtectedRoute("vendorReturns", <VendorReturns />)} />
          <Route path="/inventory" element={renderProtectedRoute("inventory", <Inventory />)} />
          <Route path="/lots" element={renderProtectedRoute("lots", <Lots />)} />
          <Route path="/warehouses" element={renderProtectedRoute("warehouses", <Warehouses />)} />

          <Route path="/wms/dashboard" element={renderProtectedRoute("wmsDashboard", <WmsDashboard />)} />
          <Route path="/wms/setup" element={renderProtectedRoute("wmsSetup", <WmsSetup />)} />
          <Route path="/wms/operations" element={renderProtectedRoute("wmsOperations", <WmsOperations />)} />
          <Route path="/wms/barcode-dashboard" element={renderProtectedRoute("barcodeDashboard", <BarcodeDashboard />)} />
          <Route path="/wms/barcode-labels" element={renderProtectedRoute("wmsBarcodeLabels", <WmsBarcodeLabels />)} />
          <Route path="/wms/barcode-generator" element={renderProtectedRoute("barcodeDashboard", <BarcodeGenerator />)} />
          <Route path="/wms/barcode-scanner" element={renderProtectedRoute("barcodeDashboard", <BarcodeHub />)} />
          <Route path="/wms/barcode-search" element={renderProtectedRoute("barcodeDashboard", <BarcodeHub />)} />
          <Route path="/wms/barcode-hub" element={renderProtectedRoute("barcodeDashboard", <BarcodeHub />)} />
          <Route path="/wms/barcode-hub/:barcode" element={renderProtectedRoute("barcodeDashboard", <BarcodeHub />)} />
          <Route path="/wms/barcode-settings" element={renderProtectedRoute("barcodeDashboard", <BarcodeSettings />)} />
          <Route path="/wms/warehouse-barcode/:barcode" element={renderProtectedRoute("barcodeDashboard", <WarehouseBarcodePage />)} />
          <Route path="/wms/zone-barcode/:barcode" element={renderProtectedRoute("barcodeDashboard", <ZoneBarcodePage />)} />
          <Route path="/wms/aisle-barcode/:barcode" element={renderProtectedRoute("barcodeDashboard", <AisleBarcodePage />)} />
          <Route path="/wms/rack-barcode/:barcode" element={renderProtectedRoute("barcodeDashboard", <RackBarcodePage />)} />
          <Route path="/wms/shelf-barcode/:barcode" element={renderProtectedRoute("barcodeDashboard", <ShelfBarcodePage />)} />
          <Route path="/wms/bin-barcode/:barcode" element={renderProtectedRoute("barcodeDashboard", <BinBarcodePage />)} />
          <Route path="/wms/item-barcode/:barcode" element={renderProtectedRoute("barcodeDashboard", <ItemBarcodePage />)} />
          <Route path="/wms/lot-barcode/:barcode" element={renderProtectedRoute("barcodeDashboard", <LotBarcodePage />)} />
          <Route path="/wms/serial-barcode/:barcode" element={renderProtectedRoute("barcodeDashboard", <SerialBarcodePage />)} />
          <Route path="/wms/po-barcode/:barcode" element={renderProtectedRoute("barcodeDashboard", <PurchaseOrderBarcodePage />)} />
          <Route path="/wms/so-barcode/:barcode" element={renderProtectedRoute("barcodeDashboard", <SalesOrderBarcodePage />)} />
          <Route path="/wms/shipment-barcode/:barcode" element={renderProtectedRoute("barcodeDashboard", <ShipmentBarcodePage />)} />
          <Route path="/wms/picklist-barcode/:barcode" element={renderProtectedRoute("barcodeDashboard", <PickListBarcodePage />)} />
          <Route path="/wms/barcode" element={renderProtectedRoute("barcodeDetails", <BarcodeHub />)} />
          <Route path="/wms/barcode/:barcode" element={renderProtectedRoute("barcodeDetails", <BarcodeHub />)} />
          <Route path="/scanner-app" element={renderProtectedRoute("wmsScannerApp", <WmsScannerApp />)} />
          <Route path="/package-dispatch" element={renderProtectedRoute("wmsPackageScreen", <WmsPackageScreen />)} />

          <Route path="/operations" element={renderProtectedRoute("operations", <Operations />)} />
          <Route path="/finance" element={renderProtectedRoute("finance", <Finance />)} />
          <Route path="/reports" element={renderProtectedRoute("reports", <Reports />)} />
          <Route path="/stock-alerts" element={renderProtectedRoute("stockAlerts", <StockAlerts />)} />
          <Route path="/scanner-device" element={renderProtectedRoute("scannerDevice", <ScannerDevicePage />)} />
          <Route path="/serial-scan" element={renderProtectedRoute("serialScan", <SerialScanPage />)} />
          <Route path="/automation" element={renderProtectedRoute("automation", <Automation />)} />
          <Route path="/local-ai" element={renderProtectedRoute("localAI", <LocalAIPage />)} />
          <Route path="/notifications" element={renderProtectedRoute("notifications", <Notifications />)} />
          <Route path="/admin" element={isAdminUser && allowedIds.includes("admin") ? <AdminPanel allowedModulesByRole={allowedModulesByRole} moduleOptions={MODULE_CONFIG} onUpdateRoleModules={persistRoleModules} isMainAdmin={isMainAdminUser} /> : <Navigate to="/" />} />
          <Route path="/system-settings" element={isMainAdminUser ? <SystemSettings /> : <Navigate to="/" />} />
          <Route path="/tenant-settings" element={isAdminUser && !isMainAdminUser ? <ClientSettings /> : <Navigate to="/" />} />

          {/* SaaS Tenant Routes */}
          <Route path="/company/dashboard" element={renderProtectedRoute("companyDashboard", <CompanyDashboard />)} />
          <Route path="/company/settings" element={renderProtectedRoute("companySettings", <CompanySettings />)} />
          <Route path="/company/subscription" element={renderProtectedRoute("subscriptionPage", <SubscriptionPage />)} />
          <Route path="/company/usage" element={renderProtectedRoute("usageAnalytics", <UsageAnalytics />)} />

          {/* Super Admin Route */}
          <Route path="/super-admin" element={isSuperAdmin ? <SuperAdminPortal /> : <Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  );
}

function AccessDenied({ moduleId }) {
  return (
    <div className="container py-5">
      <div className="card shadow-sm border-0 mx-auto" style={{ maxWidth: 520 }}>
        <div className="card-body p-4 text-center">
          <h3 className="fw-bold mb-2">Access Denied</h3>
          <p className="text-muted mb-0">You do not currently have permission to open `{moduleId}`. Please contact your admin.</p>
        </div>
      </div>
    </div>
  );
}

function Sidebar({ navItems, role, isOpen, onClose, onLogout, brandName, brandColor, brandLogo, isSuperAdmin }) {
  const [openGroup, setOpenGroup] = useState(null);
  const location = useLocation();

  return (
    <aside className={`sidebar-wrapper ${isOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-brand d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-2">
          {brandLogo ? (
            <img src={brandLogo} alt="logo" style={{ width: 28, height: 28, borderRadius: 6, objectFit: "cover" }} />
          ) : (
            <div style={{ width: 28, height: 28, borderRadius: 6, background: brandColor || "#38bdf8", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontWeight: 800, fontSize: 13 }}>{(brandName || "E")[0]}</span>
            </div>
          )}
          <h3 style={{ color: "var(--brand-color)" }} className="m-0">{brandName || "ERP PRO"}</h3>
        </div>
        <button className="btn btn-link text-white d-lg-none p-0" onClick={onClose}>✕</button>
      </div>
      <div className="sidebar-nav-container">
        <ul className="nav flex-column p-0">
          {navItems.map((item) => {
            if (item.isGroup) {
              const groupOpen = openGroup === item.id;
              return (
                <li key={item.id} className="nav-item">
                  <div className="nav-group-header" onClick={() => setOpenGroup(groupOpen ? null : item.id)}>
                    <span>{item.label}</span>
                    <span>{groupOpen ? '−' : '+'}</span>
                  </div>
                  {groupOpen && (
                    <ul className="nav flex-column sidebar-submenu">
                      {item.subModules.map(sub => (
                        <li key={sub.id}>
                          <Link to={sub.path} className={`submenu-link ${location.pathname === sub.path ? 'active' : ''}`} onClick={onClose}>{sub.label}</Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            }
            return (
              <li key={item.id} className="nav-item">
                <Link to={item.path} className={`main-link ${location.pathname === item.path ? 'active' : ''}`} onClick={onClose}>{item.label}</Link>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="sidebar-footer">
        <div className="d-flex align-items-center gap-2 mb-2 px-1">
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: brandColor || "#38bdf8", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 12 }}>{(role || "U")[0]}</span>
          </div>
          <div>
            <div className="text-white small fw-bold" style={{ lineHeight: 1.2 }}>{role}</div>
            {isSuperAdmin && <div className="text-warning" style={{ fontSize: "0.7rem" }}>Super Admin</div>}
          </div>
        </div>
        <button className="btn btn-danger btn-sm w-100 fw-bold" onClick={onLogout}>LOGOUT</button>
      </div>
    </aside>
  );
}