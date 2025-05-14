import React, { useState } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const NewArtworkIPO: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    totalShares: 100,
    pricePerShare: 100,
    categories: [] as string[],
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const availableCategories = [
    'Pintura', 'Escultura', 'Fotografia', 'Digital', 'Instalação',
    'Impressão', 'Desenho', 'Colagem', 'NFT', 'Outro'
  ];
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleCategoryToggle = (category: string) => {
    setFormData(prev => {
      const categories = prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category];
      return { ...prev, categories };
    });
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'O título da obra é obrigatório';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'A descrição da obra é obrigatória';
    }
    
    if (!imageFile && !imagePreview) {
      newErrors.image = 'Uma imagem da obra é obrigatória';
    }
    
    if (formData.totalShares < 1) {
      newErrors.totalShares = 'O número de cotas deve ser maior que zero';
    }
    
    if (formData.pricePerShare <= 0) {
      newErrors.pricePerShare = 'O preço por cota deve ser maior que zero';
    }
    
    if (formData.categories.length === 0) {
      newErrors.categories = 'Selecione pelo menos uma categoria';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !user) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Get current session for fresh token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      let imageUrl = '';
      
      // Upload image if we have a file
      if (imageFile) {
        // Create a unique filename
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 15);
        const fileExt = imageFile.name.split('.').pop();
        const sanitizedTitle = formData.title
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '-')
          .substring(0, 50);
        const fileName = `${sanitizedTitle}-${timestamp}-${randomId}.${fileExt}`;
        
        // Use the correct path format: artworks/{user_id}/{filename}
        const filePath = `${user.id}/${fileName}`;

        // Upload file
        const { error: uploadError, data } = await supabase.storage
          .from('artworks')
          .upload(filePath, imageFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('artworks')
          .getPublicUrl(filePath);
          
        imageUrl = publicUrl;
      }

      // Insert IPO record
      const { error: ipoError } = await supabase
        .from('ipos')
        .insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          image_url: imageUrl,
          category: formData.categories[0], // Using first category as primary
          price_per_share: formData.pricePerShare,
          total_shares: formData.totalShares,
          status: 'pending'
        });

      if (ipoError) throw ipoError;
      
      // Show success message and redirect
      alert('Sua obra foi submetida para avaliação e será listada em breve!');
      navigate('/profile');
      
    } catch (error) {
      console.error('Error submitting IPO:', error);
      setError('Erro ao submeter obra. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Nova Obra + IPO</h1>
      <p className="text-gray-600 mb-8">Submeta sua obra para ser listada na plataforma</p>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left column - Image upload */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Imagem da Obra</h2>
                <div 
                  className={`border-2 border-dashed rounded-lg p-6 text-center ${
                    errors.image ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {imagePreview ? (
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="max-h-80 mx-auto object-contain"
                      />
                      <button
                        type="button"
                        className="absolute top-2 right-2 bg-gray-800 bg-opacity-70 text-white p-1 rounded-full hover:bg-opacity-100"
                        onClick={() => {
                          setImagePreview(null);
                          setImageFile(null);
                        }}
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="py-12">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 mb-2">Arraste e solte ou</p>
                      <label className="inline-block bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md cursor-pointer">
                        Selecionar arquivo
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*" 
                          onChange={handleImageChange}
                        />
                      </label>
                      <p className="text-gray-400 text-sm mt-2">
                        PNG, JPG, GIF até 10MB
                      </p>
                    </div>
                  )}
                </div>
                {errors.image && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.image}
                  </p>
                )}
              </div>
              
              {/* Right column - Form fields */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Informações da Obra</h2>
                
                <div className="space-y-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Título da obra*
                    </label>
                    <input
                      type="text"
                      id="title"
                      className={`block w-full px-4 py-3 border rounded-md shadow-sm ${
                        errors.title ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-black focus:border-black'
                      }`}
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    />
                    {errors.title && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.title}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Descrição da obra*
                    </label>
                    <textarea
                      id="description"
                      rows={4}
                      className={`block w-full px-4 py-3 border rounded-md shadow-sm ${
                        errors.description ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-black focus:border-black'
                      }`}
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    />
                    {errors.description && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="totalShares" className="block text-sm font-medium text-gray-700 mb-1">
                        Número de cotas*
                      </label>
                      <input
                        type="number"
                        id="totalShares"
                        min="1"
                        className={`block w-full px-4 py-3 border rounded-md shadow-sm ${
                          errors.totalShares ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-black focus:border-black'
                        }`}
                        value={formData.totalShares}
                        onChange={(e) => setFormData(prev => ({ ...prev, totalShares: parseInt(e.target.value) || 0 }))}
                      />
                      {errors.totalShares && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.totalShares}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="pricePerShare" className="block text-sm font-medium text-gray-700 mb-1">
                        Preço por cota (R$)*
                      </label>
                      <input
                        type="number"
                        id="pricePerShare"
                        min="0.01"
                        step="0.01"
                        className={`block w-full px-4 py-3 border rounded-md shadow-sm ${
                          errors.pricePerShare ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-black focus:border-black'
                        }`}
                        value={formData.pricePerShare}
                        onChange={(e) => setFormData(prev => ({ ...prev, pricePerShare: parseFloat(e.target.value) || 0 }))}
                      />
                      {errors.pricePerShare && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.pricePerShare}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categorias*
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {availableCategories.map(category => (
                        <button
                          key={category}
                          type="button"
                          className={`px-3 py-1 rounded-full text-sm ${
                            formData.categories.includes(category)
                              ? 'bg-gray-900 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                          onClick={() => handleCategoryToggle(category)}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                    {errors.categories && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.categories}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 border-t border-gray-200 pt-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Resumo do IPO</h2>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Valor total da obra</p>
                    <p className="text-xl font-bold">
                      R$ {(formData.totalShares * formData.pricePerShare).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Taxa de IPO (5%)</p>
                    <p className="text-xl font-bold">
                      R$ {(formData.totalShares * formData.pricePerShare * 0.05).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-black text-white px-8 py-3 rounded-md font-medium hover:bg-gray-800 transition flex items-center"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processando...
                    </>
                  ) : (
                    'Submeter para avaliação'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewArtworkIPO;