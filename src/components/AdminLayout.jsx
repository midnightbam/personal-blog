import React, { useState } from 'react';
import { FileText, Folder, User, Bell, Lock, ExternalLink, LogOut, Menu, X } from 'lucide-react';
import ArticleManagement from "./admin/ArticleManagement";
import ArticleForm from "./admin/ArticleForm";
import CategoryManagement from "./admin/CategoryManagement";
import CategoryForm from "./admin/CategoryForm";
import Profile from "./admin/Profile";
import ResetPassword from "./admin/ResetPassword";
import Notification from "./admin/Notification";
import DeleteModal from "./admin/DeleteModal";

export default function AdminLayout() {
  const [activeSection, setActiveSection] = useState('Article management');
  const [currentView, setCurrentView] = useState('list');
  const [editingArticle, setEditingArticle] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [categories, setCategories] = useState([
    { id: 1, name: 'Cat' },
    { id: 2, name: 'General' },
    { id: 3, name: 'Inspiration' },
  ]);

  const [articles, setArticles] = useState([
    { id: 1, title: "Understanding Cat Behavior: Why Your Feline Friend Acts the Way They D...", category: "Cat", status: "Published" },
    { id: 2, title: "The Fascinating World of Cats: Why We Love Our Furry Friends", category: "Cat", status: "Published" },
    { id: 3, title: "Finding Motivation: How to Stay Inspired Through Life's Challenges", category: "General", status: "Published" },
    { id: 4, title: "The Science of the Cat's Purr: How It Benefits Cats and Humans Alike", category: "Cat", status: "Published" },
    { id: 5, title: "Top 10 Health Tips to Keep Your Cat Happy and Healthy", category: "Cat", status: "Published" },
    { id: 6, title: "Unlocking Creativity: Simple Habits to Spark Inspiration Daily", category: "Inspiration", status: "Published" }
  ]);

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
    setEditingCategory(null);
    setSidebarOpen(false);
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
    setEditingCategory(null);
  };

  const handleCreateCategory = () => {
    setCurrentView('create');
    setEditingCategory(null);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCurrentView('edit');
  };

  const handleSaveCategory = (categoryData) => {
    if (currentView === 'create') {
      setCategories([...categories, categoryData]);
    } else {
      setCategories(categories.map(cat => cat.id === categoryData.id ? categoryData : cat));
    }
  };

  const handleDeleteCategory = (category) => {
    setItemToDelete(category);
    setDeleteModalOpen(true);
  };

  const handleSaveArticle = (articleData) => {
    if (currentView === 'create') {
      const newId = Math.max(...articles.map(a => a.id), 0) + 1;
      setArticles([...articles, { ...articleData, id: newId }]);
    } else {
      setArticles(articles.map(art => art.id === articleData.id ? articleData : art));
    }
    setCurrentView('list');
    setEditingArticle(null);
  };

  const handleDeleteArticle = (article) => {
    setArticles(articles.filter(art => art.id !== article.id));
  };

  const handleConfirmDelete = () => {
    if (activeSection === 'Category management') {
      setCategories(categories.filter(cat => cat.id !== itemToDelete.id));
    }
    setDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const handleLogout = () => {
    console.log('Logging out...');
    window.location.href = '/login';
  };

  const handleGoToWebsite = () => {
    window.location.href = '/';
  };

  const renderContent = () => {
    const contentProps = {
      sidebarOpen,
      setSidebarOpen
    };

    if (activeSection === 'Article management') {
      if (currentView === 'create') {
        return <ArticleForm mode="create" onBack={handleBackToList} onSave={handleSaveArticle} {...contentProps} />;
      } else if (currentView === 'edit') {
        return <ArticleForm mode="edit" articleData={editingArticle} onBack={handleBackToList} onSave={handleSaveArticle} {...contentProps} />;
      } else {
        return <ArticleManagement articles={articles} onCreateClick={handleCreateArticle} onEditClick={handleEditArticle} onDelete={handleDeleteArticle} {...contentProps} />;
      }
    }

    if (activeSection === 'Category management') {
      if (currentView === 'create') {
        return <CategoryForm mode="create" onSave={handleSaveCategory} onBack={handleBackToList} {...contentProps} />;
      } else if (currentView === 'edit') {
        return <CategoryForm mode="edit" categoryData={editingCategory} onSave={handleSaveCategory} onBack={handleBackToList} {...contentProps} />;
      } else {
        return <CategoryManagement categories={categories} onCreateClick={handleCreateCategory} onEditClick={handleEditCategory} onDelete={handleDeleteCategory} deleteModalOpen={deleteModalOpen} setDeleteModalOpen={setDeleteModalOpen} itemToDelete={itemToDelete} onConfirmDelete={handleConfirmDelete} {...contentProps} />;
      }
    }

    if (activeSection === 'Profile') {
      return <Profile onBack={null} {...contentProps} />;
    }

    if (activeSection === 'Reset password') {
      return <ResetPassword {...contentProps} />;
    }

    if (activeSection === 'Notification') {
      return <Notification {...contentProps} />;
    }

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
      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-[280px] lg:w-[198px] h-screen bg-[#DAD6D1] 
        flex flex-col border-r border-stone-300
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Close button for mobile */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden absolute top-4 left-4 p-2 hover:bg-stone-400 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-stone-700" />
        </button>

        {/* Header */}
        <div className="px-5 py-8">
          <h1 className="text-2xl font-semibold text-stone-800 mb-1">hh.</h1>
          <p className="text-sm text-orange-400">Admin panel</p>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto">
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
          <button 
            onClick={handleGoToWebsite}
            className="w-full flex items-center gap-3 px-5 py-3 text-sm text-stone-600 hover:bg-stone-400 hover:text-stone-800 transition-all duration-200"
          >
            <ExternalLink className="w-4 h-4" strokeWidth={1.5} />
            <span>hh. website</span>
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-5 py-3 text-sm text-stone-600 hover:bg-stone-400 hover:text-stone-800 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" strokeWidth={1.5} />
            <span>Log out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-stone-50">
        <div className="min-h-screen flex flex-col">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}