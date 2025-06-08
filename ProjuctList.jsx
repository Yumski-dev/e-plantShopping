import React, { useState, useEffect } from 'react';

// --- Redux Toolkit Simulation (for self-contained example) ---
// In a real project, these would be in separate files like:
// src/redux/cartSlice.js, src/redux/store.js

// Simplified createSlice-like functionality for a self-contained example
const createSlice = ({ name, initialState, reducers }) => {
    const actions = {};
    const reducer = (state = initialState, action) => {
        if (action.type.startsWith(name + '/')) {
            const reducerName = action.type.substring(name.length + 1);
            if (reducers[reducerName]) {
                return reducers[reducerName](state, action);
            }
        }
        return state;
    };
    for (const key in reducers) {
        actions[key] = (payload) => ({ type: `${name}/${key}`, payload });
    }
    return { actions, reducer };
};

// Simplified configureStore-like functionality
const configureStore = (options) => {
    let state = {};
    const listeners = [];
    const reducers = options.reducer;

    const getState = () => state;

    const dispatch = (action) => {
        for (const key in reducers) {
            state = {
                ...state,
                [key]: reducers[key](state[key], action)
            };
        }
        listeners.forEach(listener => listener());
    };

    const subscribe = (listener) => {
        listeners.push(listener);
        return () => {
            const index = listeners.indexOf(listener);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        };
    };

    // Initialize state
    for (const key in reducers) {
        state[key] = reducers[key](undefined, { type: '@@INIT' });
    }

    return { getState, dispatch, subscribe };
};

// Cart Slice Definition (simulated)
const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        items: [],
    },
    reducers: {
        addItem: (state, action) => {
            const existingItem = state.items.find(item => item.name === action.payload.name);
            if (existingItem) {
                // You might want to increment quantity here if you add quantity tracking
                // For now, we'll just prevent adding duplicate names
                console.warn('Item already in cart:', action.payload.name);
            } else {
                state.items.push(action.payload);
            }
        },
        removeItem: (state, action) => {
            state.items = state.items.filter(item => item.name !== action.payload.name);
        },
        // Add more reducers as needed (e.g., updateQuantity)
    },
});

const { addItem, removeItem } = cartSlice.actions;

// Root Reducer (simulated)
const rootReducer = {
    cart: cartSlice.reducer,
};

// Store Configuration (simulated)
const store = configureStore({
    reducer: rootReducer,
});

// useDispatch and useSelector hooks (simulated)
// These would normally come from 'react-redux'
const useDispatch = () => store.dispatch;
const useSelector = (selector) => {
    const [state, setState] = useState(selector(store.getState()));
    useEffect(() => {
        const unsubscribe = store.subscribe(() => {
            setState(selector(store.getState()));
        });
        return () => unsubscribe();
    }, [selector]);
    return state;
};
// --- End Redux Toolkit Simulation ---


// --- CartItem Component (simulated for self-contained example) ---
// In a real project, this would be in a separate file like:
// src/components/CartItem.jsx

function CartItem({ onContinueShopping }) {
    const cartItems = useSelector(state => state.cart.items);
    const dispatch = useDispatch();

    const handleRemoveItem = (item) => {
        dispatch(removeItem(item));
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + parseFloat(item.cost), 0).toFixed(2);
    };

    return (
        <div className="p-4 bg-gray-100 rounded-lg shadow-inner max-w-2xl mx-auto my-8">
            <h2 className="text-2xl font-bold text-green-700 mb-4 text-center">Your Shopping Cart</h2>
            {cartItems.length === 0 ? (
                <p className="text-center text-gray-600">Your cart is empty.</p>
            ) : (
                <div className="space-y-4">
                    {cartItems.map((item, index) => (
                        <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
                            <div className="flex items-center space-x-3">
                                <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-md" />
                                <div>
                                    <h3 className="font-semibold text-lg">{item.name}</h3>
                                    <p className="text-gray-600">${item.cost}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleRemoveItem(item)}
                                className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition duration-300"
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                    <div className="text-right text-xl font-bold text-green-800 mt-4">
                        Total: ${calculateTotal()}
                    </div>
                </div>
            )}
            <button
                onClick={onContinueShopping}
                className="mt-6 w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition duration-300 text-lg font-semibold"
            >
                Continue Shopping
            </button>
        </div>
    );
}
// --- End CartItem Component ---


// --- ProductList Component ---
function ProductList({ onHomeClick }) {
    // State to control the visibility of the cart modal/page
    const [showCart, setShowCart] = useState(false);
    // State to control the visibility of the main plants list
    const [showPlants, setShowPlants] = useState(true);
    // State to track which products have been added to the cart locally
    const [addedToCart, setAddedToCart] = useState({});

    // Hardcoded plant data structure
    const plantsArray = [
        {
            category: "Air Purifying Plants",
            plants: [
                {
                    name: "Snake Plant",
                    image: "https://cdn.pixabay.com/photo/2021/01/22/06/04/snake-plant-5939187_1280.jpg",
                    description: "Produces oxygen at night, improving air quality.",
                    cost: "15"
                },
                {
                    name: "Spider Plant",
                    image: "https://cdn.pixabay.com/photo/2018/07/11/06/47/chlorophytum-3530413_1280.jpg",
                    description: "Filters formaldehyde and xylene from the air.",
                    cost: "12"
                },
                {
                    name: "Peace Lily",
                    image: "https://cdn.pixabay.com/photo/2019/06/12/14/14/peace-lilies-4269365_1280.jpg",
                    description: "Removes mold spores and purifies the air.",
                    cost: "18"
                },
                {
                    name: "Boston Fern",
                    image: "https://cdn.pixabay.com/photo/2020/04/30/19/52/boston-fern-5114414_1280.jpg",
                    description: "Adds humidity to the air and removes toxins.",
                    cost: "20"
                },
                {
                    name: "Rubber Plant",
                    image: "https://cdn.pixabay.com/photo/2020/02/15/11/49/flower-4850729_1280.jpg",
                    description: "Easy to care for and effective at removing toxins.",
                    cost: "17"
                },
                {
                    name: "Aloe Vera",
                    image: "https://cdn.pixabay.com/photo/2018/04/02/07/42/leaf-3283175_1280.jpg",
                    description: "Purifies the air and has healing properties for skin.",
                    cost: "14"
                }
            ]
        },
        {
            category: "Aromatic Fragrant Plants",
            plants: [
                {
                    name: "Lavender",
                    image: "https://images.unsplash.com/photo-1611909023032-2d6b3134ecba?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                    description: "Calming scent, used in aromatherapy.",
                    cost: "20"
                },
                {
                    name: "Jasmine",
                    image: "https://images.unsplash.com/photo-1592729645009-b96d1e63d14b?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                    description: "Sweet fragrance, promotes relaxation.",
                    cost: "18"
                },
                {
                    name: "Rosemary",
                    image: "https://cdn.pixabay.com/photo/2019/10/11/07/12/rosemary-4541241_1280.jpg",
                    description: "Invigorating scent, often used in cooking.",
                    cost: "15"
                },
                {
                    name: "Mint",
                    image: "https://cdn.pixabay.com/photo/2016/01/07/18/16/mint-1126282_1280.jpg",
                    description: "Refreshing aroma, used in teas and cooking.",
                    cost: "12"
                },
                {
                    name: "Lemon Balm",
                    image: "https://cdn.pixabay.com/photo/2019/09/16/07/41/balm-4480134_1280.jpg",
                    description: "Citrusy scent, relieves stress and promotes sleep.",
                    cost: "14"
                },
                {
                    name: "Hyacinth",
                    image: "https://cdn.pixabay.com/photo/2019/04/07/20/20/hyacinth-4110726_1280.jpg",
                    description: "Hyacinth is a beautiful flowering plant known for its fragrant.",
                    cost: "22"
                }
            ]
        },
        {
            category: "Insect Repellent Plants",
            plants: [
                {
                    name: "Oregano",
                    image: "https://cdn.pixabay.com/photo/2015/05/30/21/20/oregano-790702_1280.jpg",
                    description: "The oregano plants contains compounds that can deter certain insects.",
                    cost: "10"
                },
                {
                    name: "Marigold",
                    image: "https://cdn.pixabay.com/photo/2022/02/22/05/45/marigold-7028063_1280.jpg",
                    description: "Natural insect repellent, also adds color to the garden.",
                    cost: "8"
                },
                {
                    name: "Geraniums",
                    image: "https://cdn.pixabay.com/photo/2012/04/26/21/51/flowerpot-43270_1280.jpg",
                    description: "Known for their insect-repelling properties while adding a pleasant scent.",
                    cost: "20"
                },
                {
                    name: "Basil",
                    image: "https://cdn.pixabay.com/photo/2016/07/24/20/48/tulsi-1539181_1280.jpg",
                    description: "Repels flies and mosquitoes, also used in cooking.",
                    cost: "9"
                },
                {
                    name: "Lavender (Insect)",
                    image: "https://images.unsplash.com/photo-1611909023032-2d6b3134ecba?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                    description: "Calming scent, used in aromatherapy, and also acts as an insect repellent.",
                    cost: "20"
                },
                {
                    name: "Catnip",
                    image: "https://cdn.pixabay.com/photo/2015/07/02/21/55/cat-829681_1280.jpg",
                    description: "Repels mosquitoes and attracts cats.",
                    cost: "13"
                }
            ]
        },
        {
            category: "Medicinal Plants",
            plants: [
                {
                    name: "Aloe Vera (Medicinal)",
                    image: "https://cdn.pixabay.com/photo/2018/04/02/07/42/leaf-3283175_1280.jpg",
                    description: "Soothing gel used for skin ailments.",
                    cost: "14"
                },
                {
                    name: "Echinacea",
                    image: "https://cdn.pixabay.com/photo/2014/12/05/03/53/echinacea-557477_1280.jpg",
                    description: "Boosts immune system, helps fight colds.",
                    cost: "16"
                },
                {
                    name: "Peppermint",
                    image: "https://cdn.pixabay.com/photo/2017/07/12/12/23/peppermint-2496773_1280.jpg",
                    description: "Relieves digestive issues and headaches.",
                    cost: "13"
                },
                {
                    name: "Lemon Balm (Medicinal)",
                    image: "https://cdn.pixabay.com/photo/2019/09/16/07/41/balm-4480134_1280.jpg",
                    description: "Calms nerves and promotes relaxation.",
                    cost: "14"
                },
                {
                    name: "Chamomile",
                    image: "https://cdn.pixabay.com/photo/2016/08/19/19/48/flowers-1606041_1280.jpg",
                    description: "Soothes anxiety and promotes sleep.",
                    cost: "15"
                },
                {
                    name: "Calendula",
                    image: "https://cdn.pixabay.com/photo/2019/07/15/18/28/flowers-4340127_1280.jpg",
                    description: "Heals wounds and soothes skin irritations.",
                    cost: "12"
                }
            ]
        },
        {
            category: "Low Maintenance Plants",
            plants: [
                {
                    name: "ZZ Plant",
                    image: "https://images.unsplash.com/photo-1632207691143-643e2a9a9361?q=80&w=464&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                    description: "Thrives in low light and requires minimal watering.",
                    cost: "25"
                },
                {
                    name: "Pothos",
                    image: "https://cdn.pixabay.com/photo/2018/11/15/10/32/plants-3816945_1280.jpg",
                    description: "Tolerates neglect and can grow in various conditions.",
                    cost: "10"
                },
                {
                    name: "Snake Plant (Low Maint.)",
                    image: "https://cdn.pixabay.com/photo/2021/01/22/06/04/snake-plant-5939187_1280.jpg",
                    description: "Needs infrequent watering and is resilient to most pests.",
                    cost: "15"
                },
                {
                    name: "Cast Iron Plant",
                    image: "https://cdn.pixabay.com/photo/2017/02/16/18/04/cast-iron-plant-2072008_1280.jpg",
                    description: "Hardy plant that tolerates low light and neglect.",
                    cost: "20"
                },
                {
                    name: "Succulents",
                    image: "https://cdn.pixabay.com/photo/2016/11/21/16/05/cacti-1846147_1280.jpg",
                    description: "Drought-tolerant plants with unique shapes and colors.",
                    cost: "18"
                },
                {
                    name: "Aglaonema",
                    image: "https://cdn.pixabay.com/photo/2014/10/10/04/27/aglaonema-482915_1280.jpg",
                    description: "Requires minimal care and adds color to indoor spaces.",
                    cost: "22"
                }
            ]
        }
    ];

    // Tailwind CSS classes for dynamic styling (replacing inline styles)
    const navbarClasses = "bg-green-600 text-white p-4 flex justify-between items-center text-lg md:text-xl font-inter shadow-md rounded-b-lg";
    const logoSectionClasses = "flex items-center space-x-2";
    const logoImageClasses = "h-12 w-12 object-contain rounded-full";
    const titleLinkClasses = "text-white no-underline text-2xl font-bold flex flex-col";
    const taglineClasses = "text-sm italic opacity-80";
    const navLinksContainerClasses = "flex space-x-8 md:space-x-12";
    const navLinkClasses = "text-white text-lg md:text-xl font-semibold no-underline hover:text-green-200 transition duration-300";

    const cartIconClasses = "h-8 w-8 text-white"; // Standardizing cart icon size and color

    const productGridClasses = "p-4 grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-7xl mx-auto my-8";
    const categoryHeaderClasses = "text-3xl font-bold text-green-800 mt-8 mb-4 col-span-full text-center border-b-2 border-green-300 pb-2";
    const productListClasses = "col-span-full grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"; // To contain product cards
    const productCardClasses = "bg-white rounded-lg shadow-lg overflow-hidden transition-transform transform hover:scale-105 flex flex-col p-4";
    const productImageClasses = "w-full h-48 object-cover rounded-md mb-4";
    const productTitleClasses = "text-xl font-semibold text-gray-800 mb-2";
    const productDescriptionClasses = "text-sm text-gray-600 flex-grow mb-3";
    const productCostClasses = "text-lg font-bold text-green-700 mb-4";
    const productButtonClasses = "w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed";


    // Event handler for clicking the Home link
    const handleHomeClick = (e) => {
        e.preventDefault();
        onHomeClick(); // Calls a function passed from the parent component
    };

    // Event handler for clicking the Cart icon
    const handleCartClick = (e) => {
        e.preventDefault();
        setShowCart(true); // Shows the cart
        setShowPlants(false); // Hides the plant list
    };

    // Event handler for clicking the Plants link (assuming it shows the product list)
    const handlePlantsClick = (e) => {
        e.preventDefault();
        setShowPlants(true); // Shows the plant list
        setShowCart(false); // Hides the cart
    };

    // Event handler for "Continue Shopping" button in the cart
    const handleContinueShopping = (e) => {
        e.preventDefault();
        setShowCart(false); // Hides the cart
        setShowPlants(true); // Shows the plant list again
    };

    // Initialize useDispatch for Redux operations
    const dispatch = useDispatch();

    // Function to handle adding a product to the cart
    const handleAddToCart = (product) => {
        // Dispatch the addItem action to Redux.
        // This assumes your Redux store is configured to handle 'addItem' actions
        // and update the global cart state accordingly.
        dispatch(addItem(product));

        // Update the local 'addedToCart' state.
        // This is used to change the button text and disable it for the specific product.
        setAddedToCart((prevState) => ({
            ...prevState, // Copy all existing entries from the previous state
            [product.name]: true, // Mark this product's name as 'true' to indicate it's added
        }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 font-inter">
            {/* Navbar Section */}
            <header className={navbarClasses}>
                <div className={logoSectionClasses}>
                    <img src="https://cdn.pixabay.com/photo/2020/08/05/13/12/eco-5465432_1280.png" alt="Paradise Nursery Logo" className={logoImageClasses} />
                    <a href="/" onClick={(e) => handleHomeClick(e)} className={titleLinkClasses}>
                        <h3 className="text-white">Paradise Nursery</h3>
                        <i className={taglineClasses}>Where Green Meets Serenity</i>
                    </a>
                </div>
                <nav className={navLinksContainerClasses}>
                    <a href="#" onClick={(e) => handlePlantsClick(e)} className={navLinkClasses}>Plants</a>
                    <a href="#" onClick={(e) => handleCartClick(e)} className={navLinkClasses}>
                        {/* SVG for Cart Icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" className={cartIconClasses}>
                            <rect width="256" height="256" fill="none"></rect>
                            <circle cx="80" cy="216" r="12"></circle>
                            <circle cx="184" cy="216" r="12"></circle>
                            <path d="M42.3,72H221.7l-26.4,92.4A15.9,15.9,0,0,1,179.9,176H84.1a15.9,15.9,0,0,1-15.4-11.6L32.5,37.8A8,8,0,0,0,24.8,32H8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                        </svg>
                    </a>
                </nav>
            </header>

            {/* Conditional rendering based on showCart and showPlants state */}
            {showCart ? (
                // If showCart is true, render the CartItem component
                <CartItem onContinueShopping={handleContinueShopping} />
            ) : showPlants ? (
                // If showPlants is true (and showCart is false), render the product grid
                <main className={productGridClasses}>
                    {/* Loop through each category in plantsArray */}
                    {plantsArray.map((category, categoryIndex) => (
                        <React.Fragment key={categoryIndex}> {/* Use React.Fragment for grouping without extra div */}
                            <h2 className={categoryHeaderClasses}>
                                {category.category}
                            </h2>
                            <div className={productListClasses}> {/* Container for the list of plant cards */}
                                {/* Loop through each plant in the current category */}
                                {category.plants.map((plant, plantIndex) => (
                                    <div className={productCardClasses} key={`${category.category}-${plant.name}-${plantIndex}`}> {/* More robust key */}
                                        <img
                                            className={productImageClasses}
                                            src={plant.image} // Display the plant image
                                            alt={plant.name} // Alt text for accessibility
                                            onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/200x200/cccccc/4f4f4f?text=Image+Not+Found"; }} // Fallback image
                                        />
                                        <h3 className={productTitleClasses}>{plant.name}</h3> {/* Display plant name */}
                                        <p className={productDescriptionClasses}>{plant.description}</p> {/* Display plant description */}
                                        <p className={productCostClasses}>${plant.cost}</p> {/* Display plant cost */}
                                        <button
                                            className={productButtonClasses}
                                            onClick={() => handleAddToCart(plant)} // Handle adding plant to cart
                                            disabled={addedToCart[plant.name]} // Disable button if already added
                                        >
                                            {addedToCart[plant.name] ? 'Added to Cart' : 'Add to Cart'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </React.Fragment>
                    ))}
                </main>
            ) : (
                // Default landing page or About Us content if neither cart nor plants are shown
                <div className="text-center p-8 text-gray-700">
                    <h2 className="text-3xl font-bold mb-4">Welcome to Paradise Nursery!</h2>
                    <p className="text-lg">Discover a wide range of beautiful and healthy plants for your home and garden.</p>
                    {/* You can add more content or navigate to an About Us page here */}
                </div>
            )}
        </div>
    );
}

export default ProductList;
