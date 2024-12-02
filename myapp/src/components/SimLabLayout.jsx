import React, { useState, useEffect } from 'react';
import { Github, ExternalLink, Heart, Share2, Eye, Clock, HelpCircle, Search } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import RiemannSumSimulation from './simualtions/RiemannSumSimulation';
import AngularMomentumSimulation from './simualtions/AngularMomentumSimulation';
import { initializeApp } from "firebase/app";
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { getAnalytics } from "firebase/analytics";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  increment 
} from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

// Firebase 설정
const firebaseConfig = {
	apiKey: "AIzaSyCwYN223eXvSy-UcZPeZswjv_M1OhUXOkI",
	authDomain: "simlab-3a966.firebaseapp.com",
	projectId: "simlab-3a966",
	storageBucket: "simlab-3a966.firebasestorage.app",
	messagingSenderId: "800246220754",
	appId: "1:800246220754:web:6322ad8c0b63fae588ea0b",
	measurementId: "G-82FF3K5YGR"
  };

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const storage = getStorage(app);
// Simulation components mapping
const SIMULATION_COMPONENTS = {
	RiemannSumSimulation,
	AngularMomentumSimulation,
	
	// ... Add other simulation components
  };
  const SimulationPlaceholder = () => (
	<div className="aspect-video bg-gray-50 rounded-lg flex flex-col items-center justify-center text-gray-500">
	  <div className="text-center p-8">
		<p className="text-2xl mb-4">🚧</p>
		<p className="text-lg font-medium mb-2">Test Simulation</p>
		<p className="text-sm text-gray-400">Simulation code is not ready yet</p>
	  </div>
	</div>
  );
  const Header = ({ onSearch }) => {
	const [searchQuery, setSearchQuery] = useState('');
  
	const handleSearchChange = (e) => {
	  const query = e.target.value;
	  setSearchQuery(query);
	  onSearch(query);
	};
  
	return (
	  <div className="flex justify-between items-center py-4 mb-4 border-b border-gray-200 px-10">
		<div className="flex items-center gap-4">
		  <div className="flex items-center cursor-pointer" onClick={() => window.location.href = '/'}>
			<img 
			  src="/logo192.png"
			  alt="SimLab Logo" 
			  className="w-16 h-16 mr-4"
			/>
			<div className="flex flex-col">
			  <h1 className="text-4xl font-bold">SimLab</h1>
			  <span className="text-xl text-gray-500">Simple Simulation Lab</span>
			</div>
		  </div>
		</div>
  
		<div className="flex items-center gap-6">
		  {/* Search Bar */}
		  <div className="relative">
			<div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
			  <Search className="h-5 w-5 text-gray-400" />
			</div>
			<input
			  type="text"
			  placeholder="Search simulations..."
			  value={searchQuery}
			  onChange={handleSearchChange}
			  className="w-64 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
			/>
		  </div>
  
		  <div className="flex items-center gap-4">
			<a 
				href="https://github.com/Royaltyprogram/SimLab" 
				target="_blank" 
				rel="noopener noreferrer"
				className="flex items-center gap-2 text-base text-gray-600 hover:text-gray-900 transition-colors"
			>
				<Github size={20} />
				<span>GitHub</span>
			</a>
			<a 
				href="https://twitter.com/sim_lab" 
				target="_blank" 
				rel="noopener noreferrer"
				className="flex items-center gap-2 text-base text-gray-600 hover:text-gray-900 transition-colors"
			>
				<svg 
				viewBox="0 0 24 24" 
				width="20" 
				height="20" 
				className="fill-current"
				aria-hidden="true"
				>
				<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
				</svg>
				<span>X (Twitter)</span>
			</a>
			<a 
				href="mailto:edulens43@gmail.com"
				className="flex items-center gap-2 text-base text-gray-600 hover:text-gray-900 transition-colors"
			>
				<ExternalLink size={20} />
				<span>Contact</span>
			</a>
			</div>
		  </div>
		</div>
	);
  };

  const SimCard = ({ simulation }) => {
	const navigate = useNavigate();
	const [thumbnailUrl, setThumbnailUrl] = useState('');
	const [isHovered, setIsHovered] = useState(false);
  
	const handleClick = async () => {
	  try {
		const simulationRef = doc(db, 'simulations', simulation.id);
		await updateDoc(simulationRef, {
		  views: increment(1)
		});
		navigate(`/simulation/${simulation.id}`);
	  } catch (error) {
		console.error("Error updating views:", error);
		navigate(`/simulation/${simulation.id}`);
	  }
	};
  
	useEffect(() => {
	  const fetchThumbnail = async () => {
		try {
		  const thumbnailRef = ref(storage, simulation.thumbnailPath);
		  const url = await getDownloadURL(thumbnailRef);
		  setThumbnailUrl(url);
		} catch (error) {
		  console.error("Error fetching thumbnail:", error);
		}
	  };
  
	  fetchThumbnail();
	}, [simulation.thumbnailPath]);
  
	return (
	  <div 
		className="group relative bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl cursor-pointer border border-blue-100"
		onMouseEnter={() => setIsHovered(true)}
		onMouseLeave={() => setIsHovered(false)}
		onClick={handleClick}
	  >
		{/* Accent Corner */}
		<div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-500 to-purple-500 transform rotate-45 translate-x-12 -translate-y-12 opacity-20" />
		
		{/* Main Content */}
		<div className="relative p-5">
		  {/* Image Section */}
		  <div className="relative mb-5 rounded-xl overflow-hidden">
			<div className="aspect-video relative group-hover:scale-[1.02] transition-transform duration-500">
			  <img 
				src={thumbnailUrl || "/api/placeholder/400/320"}
				alt={simulation.name}
				className="w-full h-full object-cover rounded-xl"
			  />
			  {/* Interactive Overlay */}
			  <div className={`absolute inset-0 bg-gradient-to-t from-blue-500/10 to-purple-500/10 mix-blend-overlay transition-opacity duration-300 rounded-xl
				${isHovered ? 'opacity-100' : 'opacity-0'}`} 
			  />
			  
			  {/* View Button */}
			  <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
				<div className="px-6 py-3 bg-white/95 rounded-full shadow-lg flex items-center gap-2 transform hover:scale-105 transition-transform">
				  <Eye className="w-5 h-5 text-blue-600" />
				  <span className="font-medium text-blue-600">View Simulation</span>
				</div>
			  </div>
			</div>
  
			{/* Featured Badge - if needed */}
			{simulation.featured && (
			  <div className="absolute top-3 left-3 px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-full shadow-lg">
				Featured
			  </div>
			)}
		  </div>
  
		  {/* Title & Description */}
		  <div className="mb-4">
			<h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
			  {simulation.name}
			</h3>
			{simulation.shortDescription && (
			  <p className="text-gray-600 text-sm line-clamp-2">{simulation.shortDescription}</p>
			)}
		  </div>
  
		  {/* Footer Section */}
		  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
			{/* Contributor */}
			<div className="flex items-center gap-3">
			  <a 
				href={`https://github.com/${simulation.contributorGithub}`}
				target="_blank" 
				rel="noopener noreferrer"
				onClick={(e) => e.stopPropagation()}
				className="flex items-center gap-2 group/link"
			  >
				<div className="relative">
				  <img 
					src={simulation.contributorImage}
					alt="Contributor" 
					className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-100 group-hover/link:ring-blue-300 transition-all"
				  />
				  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-md">
					<Github size={14} className="text-gray-700" />
				  </div>
				</div>
				<div className="flex flex-col">
				  <span className="text-sm font-medium text-gray-700 group-hover/link:text-blue-600 transition-colors">
					{simulation.contributorGithub}
				  </span>
				  <span className="text-xs text-gray-500">Contributor</span>
				</div>
			  </a>
			</div>
  
			{/* Stats */}
			<div className="flex items-center gap-4 text-gray-600">
			  {/* Views */}
			  <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full">
				<Eye size={16} className="text-blue-500" />
				<span className="text-sm font-medium">{simulation.views || 0}</span>
			  </div>
			  
			  {/* Likes */}
			  <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full">
				<Heart 
				  size={16} 
				  className={simulation.likes > 0 ? 'text-pink-500' : 'text-gray-400'}
				  fill={simulation.likes > 0 ? '#EC4899' : 'none'}
				/>
				<span className="text-sm font-medium">{simulation.likes || 0}</span>
			  </div>
			</div>
		  </div>
  
		  {/* Status Indicator - if needed */}
		  {simulation.status && (
			<div className="absolute top-4 right-4 z-20">
			  <span className={`px-2.5 py-1 text-xs font-medium rounded-full 
				${simulation.status === 'New' ? 'bg-green-100 text-green-700' : 
				simulation.status === 'Updated' ? 'bg-blue-100 text-blue-700' : 
				'bg-gray-100 text-gray-700'}`}>
				{simulation.status}
			  </span>
			</div>
		  )}
		</div>
	  </div>
	);
  };

  const SimLabLayout = () => {
	const [simulations, setSimulations] = useState([]);
	const [filteredSimulations, setFilteredSimulations] = useState([]);
	const [loading, setLoading] = useState(true);
  
	useEffect(() => {
	  const fetchSimulations = async () => {
		try {
		  const simulationsCollection = collection(db, 'simulations');
		  const simulationSnapshot = await getDocs(simulationsCollection);
		  const simulationsList = simulationSnapshot.docs.map(doc => ({
			id: doc.id,
			...doc.data()
		  }));
		  setSimulations(simulationsList);
		  setFilteredSimulations(simulationsList);
		} catch (error) {
		  console.error("Error fetching simulations:", error);
		} finally {
		  setLoading(false);
		}
	  };
  
	  fetchSimulations();
	}, []);
  
	const handleSearch = (query) => {
	  if (!query.trim()) {
		setFilteredSimulations(simulations);
		return;
	  }
  
	  const filtered = simulations.filter(simulation =>
		simulation.name.toLowerCase().includes(query.toLowerCase())
	  );
	  setFilteredSimulations(filtered);
	};
  
	if (loading) {
	  return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
	}
  
	return (
	  <div className="bg-white text-black p-12">
		<Header onSearch={handleSearch} />
		{filteredSimulations.length === 0 ? (
		  <div className="flex flex-col items-center justify-center py-16">
			<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
			  <Search className="w-8 h-8 text-gray-400" />
			</div>
			<h3 className="text-xl font-medium text-gray-900 mb-2">No simulations found</h3>
			<p className="text-gray-500">Try adjusting your search terms</p>
		  </div>
		) : (
		  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 max-w-7xl mx-auto">
			{filteredSimulations.map((simulation) => (
			  <SimCard key={simulation.id} simulation={simulation} />
			))}
		  </div>
		)}
	  </div>
	);
  };
const FloatingHelp = ({ isOpen, onClose }) => {
	return (
	  <div className={`fixed bottom-6 right-6 z-50 transition-transform duration-300 ${isOpen ? 'translate-y-0' : 'translate-y-[calc(100%-4rem)]'}`}>
		<div className="bg-white rounded-2xl shadow-2xl w-80">
		  {/* Header */}
		  <div className="flex items-center justify-between p-4 bg-gray-900 rounded-t-2xl cursor-pointer"
			onClick={() => onClose(!isOpen)}>
			<div className="flex items-center gap-2 text-white">
			  <HelpCircle size={20} />
			  <span className="font-medium">How to Contribute</span>
			</div>
			<div className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
			  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
			  </svg>
			</div>
		  </div>
  
		  {/* Content */}
		  <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
			<div className="p-4 space-y-4">
			  <p className="text-gray-600 text-sm">
				Want to add a new simulation? Follow these steps:
			  </p>
			  <div className="space-y-3">
				{[
				  { icon: "🍴", text: "Fork the repository" },
				  { icon: "🌿", text: "Create a new branch" },
				  { icon: "💻", text: "Write your simulation" },
				  { icon: "🚀", text: "Submit a PR" }
				].map((step, index) => (
				  <div key={index} className="flex items-center gap-3 text-sm">
					<span className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
					  {step.icon}
					</span>
					<span className="text-gray-600">{step.text}</span>
				  </div>
				))}
			  </div>
			  <a 
				href="https://github.com/Royaltyprogram/SimLab"
				target="_blank"
				rel="noopener noreferrer"
				className="mt-4 flex items-center justify-center gap-2 w-full px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors text-sm"
			  >
				<Github size={16} />
				<span>Open GitHub</span>
				<ExternalLink size={14} />
			  </a>
			</div>
		  </div>
		</div>
	  </div>
	);
  };
  
  const AdPlaceholder = () => (
	<div className="bg-gray-100 rounded-xl p-6 min-h-[200px] flex items-center justify-center">
	  <div className="text-center">
		<p className="text-gray-500 font-medium">Advertisement</p>
		<p className="text-sm text-gray-400">Google AdSense Placeholder</p>
	  </div>
	</div>
  );

const SimulationDetail = () => {
	const { id } = useParams();
	const [simulation, setSimulation] = useState(null);
	const [loading, setLoading] = useState(true);
	const [liked, setLiked] = useState(false);
	const [likeCount, setLikeCount] = useState(0);
	const [isHelpOpen, setIsHelpOpen] = useState(false);
  
	const processDescription = (text) => {
	  if (!text) return '';
	  const unquoted = text.replace(/^["']|["']$/g, '');
	  const withLineBreaks = unquoted.replace(/  +/g, '\n\n');
	  return withLineBreaks;
	};
  
	useEffect(() => {
		const fetchSimulationData = async () => {
			try {
			  const simulationDoc = doc(db, 'simulations', id);
			  const simulationSnapshot = await getDoc(simulationDoc);
			  
			  if (simulationSnapshot.exists()) {
				const data = simulationSnapshot.data();
				
				// YYYYMMDD 형식의 숫자를 Date 객체로 변환
				let updatedDate = null;
				if (data.updatedAt) {
				  const dateStr = String(data.updatedAt); // 숫자를 문자열로 변환
				  const year = dateStr.substring(0, 4);
				  const month = dateStr.substring(4, 6);
				  const day = dateStr.substring(6, 8);
				  updatedDate = new Date(`${year}-${month}-${day}`);
				}
		  
				setSimulation({ 
				  id: simulationSnapshot.id, 
				  ...data,
				  updatedAt: updatedDate
				});
				setLikeCount(data.likes || 0);
			  }
			} catch (error) {
			  console.error("Error fetching simulation:", error);
			} finally {
			  setLoading(false);
			}
		  };
	
		fetchSimulationData();
	  }, [id]);
	
  
	const handleLike = async () => {
	  try {
		const simulationRef = doc(db, 'simulations', id);
		await updateDoc(simulationRef, {
		  likes: increment(1)
		});
		setLiked(true);
		setLikeCount(prev => prev + 1);
	  } catch (error) {
		console.error("Error updating likes:", error);
	  }
	};
  
	const handleShare = () => {
	  navigator.clipboard.writeText(window.location.href);
	  alert('URL has been copied to clipboard!');
	};
  
	if (loading) {
	  return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
		  <div className="bg-white p-8 rounded-2xl shadow-lg flex flex-col items-center">
			<div className="relative w-16 h-16">
			  <div className="absolute inset-0 rounded-full border-4 border-blue-100 border-opacity-50" />
			  <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
			</div>
			<p className="mt-4 text-gray-600 font-medium">Loading Simulation...</p>
		  </div>
		</div>
	  );
	}
  
	if (!simulation) {
	  return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
		  <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md">
			<div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
			  <ExternalLink size={32} className="text-gray-400" />
			</div>
			<p className="text-xl font-semibold text-gray-800 mb-4">Simulation Not Found</p>
			<p className="text-gray-600 mb-6">The simulation you're looking for might have been moved or deleted.</p>
			<button 
			  onClick={() => window.history.back()} 
			  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all shadow-md hover:shadow-lg"
			>
			  ← Go Back
			</button>
		  </div>
		</div>
	  );
	}
  
	const SimulationComponent = SIMULATION_COMPONENTS[simulation.componentName] || SimulationPlaceholder;
  
	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
		  <Header onOpenHelp={() => setIsHelpOpen(true)} />
		  <div className="px-6 py-8">
			<div className="max-w-6xl mx-auto">
			  <div className="flex flex-col gap-8">
				{/* Title Section */}
				<div className="bg-white rounded-2xl shadow-md p-6 mb-2">
				  <div className="flex justify-between items-start">
					<div>
					  <h1 className="text-3xl font-bold text-gray-900 mb-2">{simulation?.name}</h1>
					  <div className="flex items-center gap-4">
						<div className="flex items-center gap-2 text-gray-500">
						  <Eye size={18} />
						  <span>{simulation?.views || 0} views</span>
						</div>
						<div className="flex items-center gap-2 text-gray-500">
						  <Clock size={18} />
						  <span>Updated {simulation?.updatedAt ? simulation.updatedAt.toLocaleDateString() : 'N/A'}</span>
						</div>
					  </div>
					</div>
					<a 
					  href={`https://github.com/Royaltyprogram/SimLab_simualtions/tree/main/${simulation?.simulationFilename}`}
					  target="_blank" 
					  rel="noopener noreferrer"
					  className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors shadow-sm"
					>
					  <Github size={20} />
					  <span>View Code</span>
					</a>
				  </div>
				</div>

            {/* Top Advertisement Placeholder */}
            <div className="bg-white rounded-2xl shadow-md min-h-[90px] flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-500 font-medium">Advertisement</p>
                <p className="text-sm text-gray-400">Google AdSense Placeholder</p>
              </div>
            </div>
	
	
				{/* Main Simulation Container */}
				<div className="bg-white rounded-2xl shadow-md overflow-hidden">
				  <div className="border-b border-gray-100 p-1">
					<SimulationComponent />
				  </div>
				</div>
	
				{/* Info and Interactions Grid */}
				<div className="grid grid-cols-3 gap-6">
				  {/* Left Column: Contributor & Ad */}
				  <div className="col-span-1 flex flex-col gap-6">
					{/* Contributor Card */}
					<div className="bg-white rounded-2xl shadow-md p-6">
					  <h3 className="text-lg font-semibold mb-4">Contributor</h3>
					  <a 
						href={`https://github.com/${simulation.contributorGithub}`}
						target="_blank" 
						rel="noopener noreferrer"
						className="flex items-center gap-4 group"
					  >
						<div className="relative">
						  <img 
							src={simulation.contributorImage}
							alt="Contributor" 
							className="w-14 h-14 rounded-full ring-2 ring-blue-100 group-hover:ring-blue-200 transition-all"
						  />
						  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-md">
							<Github size={16} className="text-gray-700" />
						  </div>
						</div>
						<div>
						  <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
							{simulation.contributorGithub}
						  </h4>
						  <p className="text-sm text-gray-500">Project Contributor</p>
						</div>
					  </a>
					  <div className="flex gap-3 mt-6">
						<button 
						  onClick={handleLike}
						  disabled={liked}
						  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium transition-all
							${liked 
							  ? 'bg-pink-50 text-pink-500 border-2 border-pink-200' 
							  : 'bg-white border-2 border-gray-200 text-gray-600 hover:border-pink-200 hover:text-pink-500'
							}`}
						>
						  <Heart 
							size={18} 
							className={liked ? 'fill-pink-500 text-pink-500' : ''} 
						  />
						  <span>{likeCount}</span>
						</button>
						<button 
						  onClick={handleShare}
						  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white border-2 border-gray-200 rounded-xl font-medium text-gray-600 hover:border-blue-200 hover:text-blue-500 transition-all"
						>
						  <Share2 size={18} />
						  <span>Share</span>
						</button>
					  </div>
					</div>
	
					{/* Advertisement Placeholder */}
					<AdPlaceholder />
				  </div>
	
				  {/* Right Column: Simulation Details */}
				  <div className="col-span-2 bg-white rounded-2xl shadow-md p-6">
					<h3 className="text-lg font-semibold mb-4">Simulation Details</h3>
					<div className="prose prose-slate max-w-none">
					  <ReactMarkdown
						remarkPlugins={[remarkMath]}
						rehypePlugins={[rehypeKatex]}
						className="markdown-content"
						components={{
						  h4: ({node, ...props}) => <h4 className="text-xl font-bold mt-8 mb-4" {...props} />,
						  p: ({node, ...props}) => <p className="my-4 leading-relaxed text-gray-600" {...props} />,
						  ul: ({node, ...props}) => <ul className="list-disc pl-6 my-4 space-y-3" {...props} />,
						  li: ({node, ...props}) => <li className="my-2 text-gray-600" {...props} />,
						  strong: ({node, ...props}) => <strong className="font-semibold text-gray-800" {...props} />,
						}}
					  >
						{processDescription(simulation.description)}
					  </ReactMarkdown>
					</div>
				  </div>
				</div>
			  </div>
			</div>
		  </div>
	
		  {/* Floating Help Button */}
		  <FloatingHelp isOpen={isHelpOpen} onClose={setIsHelpOpen} />
		</div>
	  );
	};
  
  export { SimLabLayout, SimulationDetail };