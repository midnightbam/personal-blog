import React, { useState } from 'react';
import { FileText, Folder, User, Bell, Lock, ExternalLink, LogOut } from 'lucide-react';
import ArticleManagement from "./admin/ArticleManagement";
import ArticleForm from "./admin/ArticleForm";
import CategoryManagement from "./admin/CategoryManagement";
import CategoryForm from "./admin/CategoryForm";
import Profile from "./admin/Profile";
import DeleteModal from "./admin/DeleteModal";

export default function AdminLayout() {
  const [activeSection, setActiveSection] = useState('Article management');
  const [currentView, setCurrentView] = useState('list'); // 'list', 'create', 'edit'
  const [editingArticle, setEditingArticle] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [alert, setAlert] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Category state
  const [categories, setCategories] = useState([
    { id: 1, name: 'Cat' },
    { id: 2, name: 'General' },
    { id: 3, name: 'Inspiration' },
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
    setAlert(null);
  };

  const handleCreateArticle = () => {
    setCurrentView('create');
    setAlert(null);
  };

  const handleEditArticle = (article) => {
    setEditingArticle(article);
    setCurrentView('edit');
    setAlert(null);
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setEditingArticle(null);
    setEditingCategory(null);
  };

  // Category handlers
  const handleCreateCategory = () => {
    setCurrentView('create');
    setEditingCategory(null);
    setAlert(null);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCurrentView('edit');
    setAlert(null);
  };

  const handleSaveCategory = (categoryData) => {
    if (currentView === 'create') {
      setCategories([...categories, categoryData]);
    } else {
      setCategories(categories.map(cat => 
        cat.id === categoryData.id ? categoryData : cat
      ));
    }
    // Don't set currentView or alert here - let the CategoryForm handle it with toast
  };

  const handleDeleteCategory = (category) => {
    setItemToDelete(category);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (activeSection === 'Category management') {
      setCategories(categories.filter(cat => cat.id !== itemToDelete.id));
      setAlert({
        type: 'success',
        title: 'Delete category',
        message: 'Category has been successfully deleted.'
      });
    }
    setDeleteModalOpen(false);
    setItemToDelete(null);
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

    if (activeSection === 'Category management') {
      if (currentView === 'create') {
        return (
          <CategoryForm 
            mode="create" 
            onSave={handleSaveCategory}
            onBack={handleBackToList}
          />
        );
      } else if (currentView === 'edit') {
        return (
          <CategoryForm 
            mode="edit" 
            categoryData={editingCategory}
            onSave={handleSaveCategory}
            onBack={handleBackToList}
          />
        );
      } else {
        return (
          <CategoryManagement 
            categories={categories}
            onCreateClick={handleCreateCategory}
            onEditClick={handleEditCategory}
            onDelete={handleDeleteCategory}
            onBack={null}
          />
        );
      }
    }

    if (activeSection === 'Profile') {
      return <Profile onBack={null} />;
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

      {/* Delete Modal */}
      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete category"
        message="Do you want to delete this category?"
      />
    </div>
  );
}