import { Audio } from 'react-loader-spinner';
const Loader = () => {
  return (
    <div className='flex justify-center items-center w-screen h-screen'>
    <Audio height="80" width="80"  color="#082f49" ariaLabel="loading"/>
    </div>
  );
};

export default Loader;
