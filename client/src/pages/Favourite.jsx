import React, { useEffect, useState } from 'react'
import MovieCard from '../components/MovieCard'
import BlurCircle from '../components/BlurCircle'
import Loading from '../components/Loading'
import { apiFetch } from '../lib/api'
import toast from 'react-hot-toast'

const Favourite = () => {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getMovies = async () => {
      try {
        const data = await apiFetch('/api/movies/now-playing')
        setMovies(data.movies)
      } catch (error) {
        toast.error(error.message)
      } finally {
        setLoading(false)
      }
    }

    getMovies()
  }, [])

  if (loading) return <Loading />

  return movies.length > 0 ? (
    <div className='relative my-40 mb-60 px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[80vh]'>

        <BlurCircle top="150px" left="0px"/>
        <BlurCircle bottom="50px" right="50px"/>
      <h1 className='text-lg font-medium my-4'>Your Favourites</h1>
      <div className='flex flex-wrap gap-8 justify-center'> 
        {movies.map((movie)=>(
            <MovieCard movie={movie} key={movie._id}/>
        ))}
      </div>
    </div>
  ) : <div className='flex flex-col items-center justify-center h-screen'>
        <h1
        className='text-3xl font-bold text-center'>No Movies Available</h1>
  </div>
}

export default Favourite
