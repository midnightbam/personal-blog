import React, { useState } from 'react';
import { FileText, Folder, User, Bell, Lock, ExternalLink, LogOut } from 'lucide-react';
import ArticleManagement from "./admin/ArticleManagement";
import ArticleForm from "./admin/ArticleForm";

export default function AdminLayout() {
  const [activeSection, setActiveSection] = useState('Article management');
  const [currentView, setCurrentView] = useState('list'); // 'list', 'create', 'edit'
  const [editingArticle, setEditingArticle] = useState(null);

  const menuItems = [
    { icon: FileText, label: 'Article management' },
    { icon: Folder, label: 'Category management' },
    { icon: User, label: 'Profile' },
    { icon: Bell, label: 'Notification' },
    { icon: Lock, label: 'Reset password' },
  ];

  const handleMenuClick = (label) => {
    setActiveSection(label);
    setCurrentView('list');
    setEditingArticle(null);
  };

  const handleCreateArticle = () => {
    setCurrentView('create');
  };

  const handleEditArticle = (article) => {
    setEditingArticle(article);
    setCurrentView('edit');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setEditingArticle(null);
  };

  const renderContent = () => {
    if (activeSection === 'Article management') {
      if (currentView === 'create') {
        return <ArticleForm mode="create" onBack={handleBackToList} />;
      } else if (currentView === 'edit') {
        return <ArticleForm mode="edit" articleData={editingArticle} onBack={handleBackToList} />;
      } else {
        return (
          <ArticleManagement 
            onCreateClick={handleCreateArticle}
            onEditClick={handleEditArticle}
          />
        );
      }
    }

    // Placeholder for other sections
    return (
      <div className="flex-1 bg-stone-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-stone-800 mb-2">{activeSection}</h2>
          <p className="text-stone-600">This section is coming soon...</p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="w-[198px] h-screen bg-[#DAD6D1] flex flex-col border-r border-stone-300">
        {/* Header */}
        <div className="px-5 py-8">
          <h1 className="text-2xl font-semibold text-stone-800 mb-1">hh.</h1>
          <p className="text-sm text-orange-400">Admin panel</p>
        </div>

        {/* Menu Items */}
        <nav className="flex-1">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => handleMenuClick(item.label)}
              className={`w-full flex items-center gap-3 px-5 py-3 text-sm text-left transition-all duration-200 ${
                activeSection === item.label
                  ? 'bg-stone-400 text-stone-800'
                  : 'text-stone-600 hover:bg-stone-400 hover:text-stone-800'
              }`}
            >
              <item.icon className="w-4 h-4" strokeWidth={1.5} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Bottom Links */}
        <div className="pb-6">
          <button className="w-full flex items-center gap-3 px-5 py-3 text-sm text-stone-600 hover:bg-stone-400 hover:text-stone-800 transition-all duration-200">
            <ExternalLink className="w-4 h-4" strokeWidth={1.5} />
            <span>hh. website</span>
          </button>
          <button className="w-full flex items-center gap-3 px-5 py-3 text-sm text-stone-600 hover:bg-stone-400 hover:text-stone-800 transition-all duration-200">
            <LogOut className="w-4 h-4" strokeWidth={1.5} />
            <span>Log out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-scroll bg-stone-50">
        {/* Consistent layout container */}
        <div className="min-h-screen flex flex-col">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
