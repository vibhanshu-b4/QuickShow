import React, { useEffect, useState } from 'react'
import ReactPlayer from 'react-player';
import BlurCircle from './BlurCircle';
import { PlayCircleIcon } from 'lucide-react';
import { apiFetch } from '../lib/api';

const TrailerSection = () => {

    const [trailers, setTrailers] = useState([]);
    const [currentTrailer, setCurrentTrailer] = useState(null);

    useEffect(() => {
        const getTrailers = async () => {
            try {
                const data = await apiFetch('/api/movies/now-playing')
                const movieTrailers = data.movies
                    .filter(movie => movie.trailerUrl)
                    .slice(0, 4)
                    .map(movie => ({
                        image: movie.trailerImage,
                        videoUrl: movie.trailerUrl
                    }))

                setTrailers(movieTrailers)
                setCurrentTrailer(movieTrailers[0] || null)
            } catch (error) {
                console.error(error)
            }
        }

        getTrailers()
    }, [])


    return (
        <div className='px-6 md:px-16 lg:px-24 xl:px-44 py-20 overflow-hidden'>

            <p className='text-gray-300 font-medium text-lg max-w-[960] mx-auto'>Trailers</p>
            <div className='relative mt-6 flex justify-center'>
                <BlurCircle top='-100px' right='-100px' />
                <div className="w-full max-w-2xl aspect-video">
                    {currentTrailer && <ReactPlayer
                        url={currentTrailer.videoUrl}
                        width="100%"
                        height="100%"
                        controls
                        style={{ borderRadius: "1rem", overflow: "hidden" }}
                    />}
                </div>
            </div>
            <div className='group grid grid-cols-4 gap-4 md:gap-8 mt-8 max-w-3xl mx-auto'>
                {trailers.map((trailer) => (
                    <div key={trailer.image} className='relative group-hover:not-hover:opacity-50 hover:-translate-y-1 duration-300 transition max-md:h-60md:max-h-60 cursor-pointer'
                        onClick={() => setCurrentTrailer(trailer)}>
                        <img src={trailer.image} alt="trailer" className="rounded-lg w-full h-full object-cover brightness-75" />
                        <PlayCircleIcon strokeWidth={1.6} className='absolute top-1/2 left-1/2 w-5 md:w-8 h-5 md:h-12 transform -translate-x-1/2 -translate-y-1/2' />

                    </div>

                ))}
            </div>

        </div>
    )
}

export default TrailerSection
