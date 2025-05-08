import { useNavigate } from 'react-router-dom';

const RoleSelection = () => {
  const navigate = useNavigate();

  const handleSelect = (role) => {
    if (role === 'admin') {
      navigate('/login?role=admin');
    } else {
      navigate('/login?role=user');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-6">Select Your Role</h1>
        <div className="space-x-4">
          <button
            onClick={() => handleSelect('admin')}
            className="px-6 py-3 bg-kenya-red text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Admin
          </button>
          <button
            onClick={() => handleSelect('user')}
            className="px-6 py-3 bg-kenya-green text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            User
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
