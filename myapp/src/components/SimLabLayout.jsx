import React, { useState, useEffect, useRef } from 'react';
import { Github, ExternalLink, Heart, Share2, Eye } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { initializeApp } from "firebase/app";
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
const Header = () => {
	return (
	  <div className="flex justify-between items-center py-4 mb-4 border-b border-gray-200 px-6">
		<div className="flex items-center gap-4">
		  <h1 className="text-2xl font-bold cursor-pointer" onClick={() => window.location.href = '/'}>SimLab</h1>
		  <span className="text-sm text-gray-500">Simple Simulation Lab</span>
		</div>
		<div className="flex items-center gap-4">
		  <a 
			href="https://github.com/your-username" 
			target="_blank" 
			rel="noopener noreferrer"
			className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
		  >
			<Github size={20} />
			<span>GitHub</span>
		  </a>
		  <a 
			href="https://your-portfolio.com" 
			target="_blank" 
			rel="noopener noreferrer"
			className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
		  >
			<ExternalLink size={20} />
			<span>Portfolio</span>
		  </a>
		</div>
	  </div>
	);
  };

  const SimCard = ({ simulation }) => {
	const navigate = useNavigate();
	const [thumbnailUrl, setThumbnailUrl] = useState('');
  
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
		className="flex flex-col border border-gray-300 rounded-lg p-6 gap-4 cursor-pointer hover:shadow-lg transition-shadow"
		onClick={handleClick}
	  >
		<div className="h-80 flex items-center justify-center border border-gray-300 rounded-lg">
		  <img 
			src={thumbnailUrl || "/api/placeholder/400/320"}
			alt={simulation.name} 
			className="w-full h-full object-cover rounded-lg"
		  />
		</div>
		<div className="text-lg">
		  {simulation.name}
		</div>
		<div className="flex items-center justify-between">
		  <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
			<a 
			  href={`https://github.com/${simulation.contributorGithub}`}
			  target="_blank" 
			  rel="noopener noreferrer"
			  className="flex items-center gap-3 text-gray-600 hover:text-gray-900 transition-colors"
			>
			  <img 
				src={simulation.contributorImage}
				alt="GitHub profile" 
				className="w-8 h-8 rounded-full"
			  />
			  <span className="text-gray-900">{simulation.contributorGithub}</span>
			  <Github size={16} />
			</a>
		  </div>
		  <div className="flex items-center gap-4 text-gray-500">
			<div className="flex items-center gap-1">
			  <Eye size={16} />
			  <span>{simulation.views || 0}</span>
			</div>
			<div className="flex items-center gap-1">
			  <Heart size={16} />
			  <span>{simulation.likes || 0}</span>
			</div>
		  </div>
		</div>
	  </div>
	);
};

const SimLabLayout = () => {
  const [simulations, setSimulations] = useState([]);
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
      } catch (error) {
        console.error("Error fetching simulations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSimulations();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="bg-white text-black p-12">
      <Header />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 max-w-7xl mx-auto">
        {simulations.map((simulation) => (
          <SimCard key={simulation.id} simulation={simulation} />
        ))}
      </div>
    </div>
  );
};

const SimulationDetail = () => {
	const { id } = useParams();
	const [simulation, setSimulation] = useState(null);
	const [simulationCode, setSimulationCode] = useState(null);
	const [loading, setLoading] = useState(true);
	const [liked, setLiked] = useState(false);
	const [likeCount, setLikeCount] = useState(0);
  
	const SimulationPlaceholder = () => (
	  <div className="aspect-video bg-gray-50 rounded-lg flex flex-col items-center justify-center text-gray-500">
		<div className="text-center p-8">
		  <p className="text-2xl mb-4">🚧</p>
		  <p className="text-lg font-medium mb-2">테스트 시뮬레이션</p>
		  <p className="text-sm text-gray-400">시뮬레이션 코드가 준비되지 않았습니다</p>
		</div>
	  </div>
	);
  
	useEffect(() => {
	  const fetchSimulationData = async () => {
		try {
		  const simulationDoc = doc(db, 'simulations', id);
		  const simulationSnapshot = await getDoc(simulationDoc);
		  
		  if (simulationSnapshot.exists()) {
			const simulationData = { 
			  id: simulationSnapshot.id, 
			  ...simulationSnapshot.data() 
			};
			setSimulation(simulationData);
			setLikeCount(simulationData.likes || 0);
			  
			if (!simulationData.githubRepo || !simulationData.simulationFilename) {
			  console.log("Missing GitHub repo or simulation filename - showing placeholder");
			  setSimulationCode(() => SimulationPlaceholder);
			  return;
			}
			
			try {
			  // GitHub raw content URL 구성
			  const rawUrl = `https://raw.githubusercontent.com/${simulationData.githubRepo}/main/src/components/simulations/${simulationData.simulationFilename}.jsx`;
			  
			  // 파일 내용 가져오기
			  const response = await fetch(rawUrl);
			  if (!response.ok) {
				throw new Error('Failed to fetch simulation code');
			  }
			  const fileContent = await response.text();
			  
			  try {
				// 컴포넌트 생성
				const ComponentFunction = new Function('React', 'useState', 'useEffect', 'useRef', `
				  ${fileContent}
				  return ${simulationData.componentName || 'SimulationComponent'};
				`);
				
				const SimComponent = ComponentFunction(React, useState, useEffect, useRef);
				setSimulationCode(() => SimComponent);
			  } catch (error) {
				console.error("Error creating simulation component:", error);
				setSimulationCode(() => SimulationPlaceholder);
			  }
			} catch (error) {
			  console.error("Error fetching simulation file:", error);
			  setSimulationCode(() => SimulationPlaceholder);
			}
		  } else {
			setSimulationCode(() => SimulationPlaceholder);
		  }
		} catch (error) {
		  console.error("Error fetching simulation:", error);
		  setSimulationCode(() => SimulationPlaceholder);
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
	  alert('URL이 클립보드에 복사되었습니다!');
	};
  
	if (loading) {
	  return (
		<div className="min-h-screen bg-white flex items-center justify-center">
		  <div className="flex flex-col items-center">
			<div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
			<p className="mt-4 text-gray-600">Loading...</p>
		  </div>
		</div>
	  );
	}
  
	if (!simulation) {
	  return (
		<div className="min-h-screen bg-white flex items-center justify-center">
		  <div className="text-center">
			<p className="text-xl text-gray-600">시뮬레이션을 찾을 수 없습니다</p>
			<button 
			  onClick={() => window.history.back()} 
			  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
			>
			  이전 페이지로 돌아가기
			</button>
		  </div>
		</div>
	  );
	}
  
	const SimulationComponent = simulationCode || SimulationPlaceholder;
	const githubCodeUrl = simulation.githubRepo ? 
	  `https://github.com/${simulation.githubRepo}/blob/main/src/components/simulations/${simulation.simulationFilename}.jsx` : 
	  null;
  
	return (
	  <div className="min-h-screen bg-white">
		<Header />
		<div className="p-6">
		  <div className="max-w-5xl mx-auto">
			<div className="flex flex-col gap-6">
			  {/* Simulation screen */}
			  <div className="rounded-lg border border-gray-200">
				{simulationCode ? <SimulationComponent /> : <SimulationPlaceholder />}
			  </div>
			  
			  {/* Simulation name and GitHub info */}
			  <div className="py-4 border-b border-gray-200 flex justify-between items-center">
				<div>
				  <h2 className="text-xl">{simulation.name}</h2>
				  <div className="mt-2 flex items-center gap-2">
					<Eye size={20} className="text-gray-500" />
					<span className="text-gray-500">{simulation.views || 0} views</span>
				  </div>
				</div>
				{githubCodeUrl ? (
				  <a 
					href={githubCodeUrl}
					target="_blank" 
					rel="noopener noreferrer"
					className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
				  >
					<Github size={20} />
					<span>View Code on GitHub</span>
				  </a>
				) : (
				  <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-400">
					<Github size={20} />
					<span>Code not available</span>
				  </div>
				)}
			  </div>
			  
			  {/* Contributor info and buttons */}
			  <div className="flex justify-between items-center py-4 border-b border-gray-200">
				<div className="flex items-center gap-3">
				  <a 
					href={`https://github.com/${simulation.contributorGithub}`}
					target="_blank" 
					rel="noopener noreferrer"
					className="flex items-center gap-3 text-gray-600 hover:text-gray-900 transition-colors"
				  >
					<img 
					  src={simulation.contributorImage}
					  alt="GitHub profile" 
					  className="w-8 h-8 rounded-full"
					/>
					<span className="text-gray-900">{simulation.contributorGithub}</span>
					<Github size={16} />
				  </a>
				</div>
				<div className="flex items-center gap-4">
				  <button 
					onClick={handleLike}
					disabled={liked}
					className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				  >
					<Heart 
					  size={20} 
					  className={liked ? "text-red-500 fill-red-500" : "text-gray-500"} 
					/>
					<span>{likeCount} Likes</span>
				  </button>
				  <button 
					onClick={handleShare}
					className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
				  >
					<Share2 size={20} />
					<span>Share</span>
				  </button>
				</div>
			  </div>
  
			  {/* Simulation description */}
			  <div className="py-4">
				<h3 className="text-center text-lg mb-4">시뮬레이션 상세 설명</h3>
				<div className="min-h-[200px] border border-gray-200 rounded-lg p-4">
				  <div className="mb-4">{simulation.description}</div>
				  <div className="mt-6 pt-6 border-t border-gray-200">
					<h4 className="text-lg mb-2">기여하기</h4>
					<p className="text-gray-600 mb-4">
					  새로운 시뮬레이션을 추가하고 싶으신가요? GitHub 레포지토리에서 기여해주세요:
					</p>
					<ol className="list-decimal list-inside space-y-2 text-gray-600">
					  <li>SimLab GitHub 레포지토리를 Fork 하세요</li>
					  <li>새로운 브랜치를 생성하세요</li>
					  <li>시뮬레이션 코드를 작성하고 커밋하세요</li>
					  <li>Pull Request를 생성하세요</li>
					</ol>
					{simulation.githubRepo && (
					  <a 
						href={`https://github.com/${simulation.githubRepo}`}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-800"
					  >
						<Github size={16} />
						<span>SimLab Repository</span>
						<ExternalLink size={16} />
					  </a>
					)}
				  </div>
				</div>
			  </div>
			</div>
		  </div>
		</div>
	  </div>
	);
  };
  
  export { SimLabLayout, SimulationDetail };