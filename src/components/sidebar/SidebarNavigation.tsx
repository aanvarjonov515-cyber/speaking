import React from 'react';
import {
  Home,
  BookOpen,
  Mic,
  PenTool,
  BarChart2,
  Brain,
  Settings,
  ChevronLeft,
  ChevronRight,
  User,
  Sparkles,
  GraduationCap,
} from 'lucide-react';

export type NavItem = 'curriculum' | 'reading' | 'speaking' | 'writing' | 'progress' | 'words' | 'settings';

interface SidebarNavigationProps {
  currentTab: NavItem;
  onSelectTab: (tab: NavItem) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  currentTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
}) => {
  const menuItems = [
    { id: 'curriculum' as NavItem, label: 'O\'quv Dasturi (0-IELTS 8)', icon: GraduationCap },
    { id: 'reading' as NavItem, label: 'Reading Studio', icon: BookOpen },
    { id: 'speaking' as NavItem, label: 'Speaking Studio', icon: Mic },
    { id: 'writing' as NavItem, label: 'Writing Studio', icon: PenTool },
    { id: 'progress' as NavItem, label: 'Progress', icon: BarChart2 },
    { id: 'words' as NavItem, label: 'My Words', icon: Brain },
    { id: 'settings' as NavItem, label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={`h-full bg-slate-950 border-r border-slate-800 flex flex-col justify-between transition-all duration-200 select-none shrink-0 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Top Branding Section */}
      <div>
        <div className="flex items-center justify-between p-4 border-b border-slate-800/80">
          {!collapsed && (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="truncate">
                <div className="font-bold text-sm text-slate-100 tracking-tight leading-none">
                  English AI Teacher
                </div>
                <div className="text-[10px] text-indigo-400 font-mono mt-1">
                  Desktop Studio
                </div>
              </div>
            </div>
          )}

          {collapsed && (
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white mx-auto shadow-md shadow-indigo-600/30">
              <Sparkles className="w-4 h-4" />
            </div>
          )}

          <button
            onClick={onToggleCollapse}
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors hidden sm:block"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation List */}
        <nav className="p-2 space-y-1 mt-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!collapsed && (
                  <div className="flex-1 flex items-center justify-between truncate">
                    <span>{item.label}</span>
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom User Profile Section */}
      <div className="p-3 border-t border-slate-800/80">
        <div
          className={`flex items-center gap-3 p-2 rounded-xl bg-slate-900/60 border border-slate-800/60 ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
            A
          </div>
          {!collapsed && (
            <div className="truncate">
              <div className="text-xs font-semibold text-slate-200 truncate">
                English Learner
              </div>
              <div className="text-[10px] text-emerald-400 font-mono">
                Level: A2 (Elementary)
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
