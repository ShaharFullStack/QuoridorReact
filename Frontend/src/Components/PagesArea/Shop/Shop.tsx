import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShopItem } from '../../../Types';
import './Shop.css';

// Mock shop items - will be replaced with real API data
const mockShopItems: ShopItem[] = [
    {
        id: '1',
        name: 'Stone Tiles Board',
        description: 'Classic stone tile texture for the game board',
        category: 'board',
        type: 'coins',
        price: 500,
        rarity: 'common',
        previewImage: '/assets/textures/stone-tile4b_bl/tile4b_preview.jpg',
        texturePath: '/assets/textures/stone-tile4b_bl/',
        isOwned: true,
        isEquipped: true,
        isOnSale: false
    },
    {
        id: '2',
        name: 'Dark Tiles Board',
        description: 'Mysterious dark tiles for a dramatic look',
        category: 'board',
        type: 'coins',
        price: 750,
        rarity: 'rare',
        previewImage: '/assets/textures/darktiles1-bl/darktiles1_preview.jpg',
        texturePath: '/assets/textures/darktiles1-bl/',
        isOwned: false,
        isEquipped: false,
        isOnSale: true,
        originalPrice: 1000
    },
    {
        id: '3',
        name: 'Victorian Brick Wall',
        description: 'Elegant Victorian brick texture for walls',
        category: 'wall',
        type: 'coins',
        price: 600,
        rarity: 'rare',
        previewImage: '/assets/textures/victorian-brick-unity/victorian-brick_preview.jpg',
        texturePath: '/assets/textures/victorian-brick-unity/',
        isOwned: false,
        isEquipped: false,
        isOnSale: false
    },
    {
        id: '4',
        name: 'Golden Board Theme',
        description: 'Luxurious golden board with special effects',
        category: 'board',
        type: 'diamonds',
        price: 25,
        rarity: 'legendary',
        previewImage: '/assets/textures/golden-theme/preview.jpg',
        isOwned: false,
        isEquipped: false,
        isOnSale: false
    }
];

export function Shop(): JSX.Element {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [shopItems] = useState<ShopItem[]>(mockShopItems);
    const [userCoins] = useState(1250);
    const [userDiamonds] = useState(25);
    const navigate = useNavigate();

    const categories = [
        { id: 'all', name: 'All Items' },
        { id: 'board', name: 'Board Themes' },
        { id: 'wall', name: 'Wall Textures' },
        { id: 'goal', name: 'Goal Effects' },
        { id: 'player', name: 'Player Skins' }
    ];

    const filteredItems = selectedCategory === 'all' 
        ? shopItems 
        : shopItems.filter(item => item.category === selectedCategory);

    const handlePurchase = (item: ShopItem) => {
        if (item.isOwned) return;
        
        const hasEnoughCurrency = item.type === 'coins' 
            ? userCoins >= item.price
            : userDiamonds >= item.price;

        if (!hasEnoughCurrency) {
            alert(`Not enough ${item.type}!`);
            return;
        }

        // TODO: Implement actual purchase logic
        console.log('Purchasing item:', item);
        alert(`Successfully purchased ${item.name}!`);
    };

    const handleEquip = (item: ShopItem) => {
        if (!item.isOwned) return;
        
        // TODO: Implement equip logic
        console.log('Equipping item:', item);
        alert(`Equipped ${item.name}!`);
    };

    const getRarityColor = (rarity: string) => {
        switch (rarity) {
            case 'common': return '#95a5a6';
            case 'rare': return '#3498db';
            case 'epic': return '#9b59b6';
            case 'legendary': return '#f1c40f';
            default: return '#95a5a6';
        }
    };

    return (
        <div className="Shop">
            <div className="shop-header">
                <div className="shop-title">
                    <h1>Quoridor Shop</h1>
                    <p>Customize your game with unique themes and textures</p>
                </div>
                
                <div className="shop-currency">
                    <div className="currency-display">
                        <span className="currency-icon">🪙</span>
                        <span>{userCoins.toLocaleString()}</span>
                    </div>
                    <div className="currency-display">
                        <span className="currency-icon">💎</span>
                        <span>{userDiamonds}</span>
                    </div>
                </div>
                
                <button 
                    className="back-button"
                    onClick={() => navigate('/dashboard')}
                >
                    ← Back to Dashboard
                </button>
            </div>

            <div className="shop-content">
                <div className="shop-sidebar">
                    <h3>Categories</h3>
                    <div className="category-list">
                        {categories.map(category => (
                            <button
                                key={category.id}
                                className={selectedCategory === category.id ? 'active' : ''}
                                onClick={() => setSelectedCategory(category.id)}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="shop-items">
                    <div className="items-grid">
                        {filteredItems.map(item => (
                            <div key={item.id} className="shop-item-card">
                                <div className="item-preview">
                                    <div 
                                        className="preview-placeholder"
                                        style={{ borderColor: getRarityColor(item.rarity) }}
                                    >
                                        <span>{item.name[0]}</span>
                                    </div>
                                    <div 
                                        className="rarity-badge"
                                        style={{ backgroundColor: getRarityColor(item.rarity) }}
                                    >
                                        {item.rarity}
                                    </div>
                                </div>
                                
                                <div className="item-info">
                                    <h4>{item.name}</h4>
                                    <p>{item.description}</p>
                                    
                                    <div className="item-price">
                                        <span className="currency-icon">
                                            {item.type === 'coins' ? '🪙' : '💎'}
                                        </span>
                                        <span className="price">{item.price}</span>
                                        {item.originalPrice && (
                                            <span className="original-price">
                                                {item.originalPrice}
                                            </span>
                                        )}
                                    </div>
                                    
                                    <div className="item-actions">
                                        {item.isOwned ? (
                                            <button 
                                                className={`equip-button ${item.isEquipped ? 'equipped' : ''}`}
                                                onClick={() => handleEquip(item)}
                                                disabled={item.isEquipped}
                                            >
                                                {item.isEquipped ? 'Equipped' : 'Equip'}
                                            </button>
                                        ) : (
                                            <button 
                                                className="purchase-button"
                                                onClick={() => handlePurchase(item)}
                                            >
                                                Purchase
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}