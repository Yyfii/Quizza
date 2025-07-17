import { useEffect, useState } from "react";
import { FaChevronDown, FaChevronRight, FaGears } from "react-icons/fa6";
import { FiTable } from "react-icons/fi";
import { GoGraph } from "react-icons/go";
import { HiOutlineClipboardDocumentList } from "react-icons/hi2";
import { MdOutlineHeadsetMic, MdSpaceDashboard } from "react-icons/md";
import { RxBookmark } from "react-icons/rx";
import {
  TbLayoutSidebarLeftCollapse,
  TbLayoutSidebarLeftExpand,
} from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import Topbar from "./Topbar"; // importe aqui

const Sidebar = ({ children }) => {
  const navigate = useNavigate();

  const [open, setOpen] = useState(true);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showTopButton, setShowTopButton] = useState(false);

  const [subMenus, setSubMenus] = useState({
    list: false,
    support: false,
    explore: false,
    analytics: false,
    quiz: false,
    settings: false,
  });

  const toggleSubMenu = (menu) => {
    setSubMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  const Menus = [
    { title: "Dashboard", icon: <MdSpaceDashboard />, path: "/explorar", },
    {
      title: "Simulados",
      icon: <HiOutlineClipboardDocumentList />,
      gap: true,
      subMenu: ["Novo Simulado", "Meus Simulados"],
      key: "quiz",
    },
    { title: "Lista", icon: <RxBookmark />, path: "/lista", },
    { title: "Explorar", icon: <FiTable />, path: "/explorar", },
    {
      title: "Análise",
      icon: <GoGraph />,
      path: "/analise", // Adicione esta linha
    },
    { title: "Suporte", icon: <MdOutlineHeadsetMic /> },
    {
      title: "Configuração",
      icon: <FaGears />,
      subMenu: ["Geral", "Segurança", "Notificações"],
      key: "settings",
    },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowTopButton(window.scrollY > 200); // só aparece após rolar 200px
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="w-full flex">
      {/* Sidebar */}
      <div
        className={`${
          open ? "w-72 p-5" : "w-20 p-4"
        } bg-slate-900 fixed top-0 bottom-0 left-0 pt-8 duration-300 ease-un-out`}
      >
        <div
          className={`absolute cursor-pointer -right-4 top-9 w-8 h-8 p-0.5 bg-indigo-100 border-2 border-indigo-200 rounded-full text-xl flex items-center justify-center transition-all duration-300 ${
            !open && "rotate-180"
          }`}
          onClick={() => {
            setOpen((prevOpen) => {
              if (prevOpen) {
                setSubMenus({
                  list: false,
                  support: false,
                  tables: false,
                  analytics: false,
                  inbox: false,
                  settings: false,
                });
              }
              return !prevOpen;
            });
          }}
        >
          {open ? (
            <TbLayoutSidebarLeftExpand />
          ) : (
            <TbLayoutSidebarLeftCollapse />
          )}
        </div>

        <div className="flex gap-x-4 items-center">
          <img
            src="https://cdn.pixabay.com/photo/2017/02/18/19/20/logo-2078018_640.png"
            alt="logo"
            className={`w-10 h-10 rounded-full object-cover object-center cursor-pointer border-2 border-indigo-500 duration-300 ${
              open && "rotate-[360deg]"
            }`}
          />
          <h1
            className={`text-white origin-left font-semibold text-xl duration-200 ease-in-out ${
              !open && "scale-0"
            }`}
          >
            Admin Dashboard
          </h1>
        </div>

        <ul className="pt-6 space-y-0.5">
          {Menus.map((Menu, index) => (
            <li
              key={index}
              className={`flex flex-col rounded-md py-3 px-4 cursor-pointer text-indigo-300 hover:text-white hover:bg-[#333A5C] transition-all duration-300 ${
                Menu.gap ? "mt-9" : "mt-2"
              } ${index === 0 && "bg-[#333A5C]"}`}
            >
              <div
                className="flex items-center gap-x-4"
                onClick={() => {
                  if (!open) return;

                  if (Menu.subMenu) {
                    toggleSubMenu(Menu.key);
                  } else if (Menu.path) {
                    navigate(Menu.path); // Navega para o path definido
                  }
                }}
              >
                {/* Restante do código permanece o mesmo */}
                <div className="flex items-center justify-between gap-x-4">
                  <span className="text-lg">{Menu.icon}</span>
                  <span className={`${!open && "hidden"} origin-left`}>
                    {Menu.title}
                  </span>
                </div>

                {Menu.subMenu && (
                  <span
                    className={`text-sm ml-auto transition-transform ${
                      subMenus[Menu.key] ? "rotate-90" : ""
                    } ${!open ? "hidden" : ""}`}
                  >
                    {subMenus[Menu.key] ? (
                      <FaChevronDown />
                    ) : (
                      <FaChevronRight />
                    )}
                  </span>
                )}
              </div>

              {/* Restante do código dos submenus permanece o mesmo */}
              {Menu.subMenu && subMenus[Menu.key] && (
                <ul className="pl-3 pt-4 text-indigo-200">
                  {Menu.subMenu.map((subMenu, subIndex) => (
                    <li
                      key={subIndex}
                      className="text-sm flex items-center gap-x-2 py-3 px-2 hover:bg-[#2b2f4e] rounded-lg"
                      onClick={() => {
                        if (subMenu === "Meus Simulados") {
                          navigate("/quiz-list");
                        } else if (subMenu === "Novo Simulado") {
                          navigate("/new-quiz");
                        }
                      }}
                    >
                      <FaChevronRight className="text-xs" />
                      {subMenu}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Main dashboard content */}
      <div
        className={`flex-1 bg-zinc-100 min-h-screen transition-all duration-300 ${
          open ? "ml-72" : "ml-20"
        }`}
      >
        <Topbar />
        {showTopButton && (
          <button
            className="fixed bottom-6 right-6 z-40 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full shadow-lg transition-all duration-300 cursor-pointer"
            onClick={scrollToTop}
          >
            ↑ Topo
          </button>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default Sidebar;
