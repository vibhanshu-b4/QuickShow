import React, { useEffect, useState } from 'react'
import Loading from '../../components/Loading';
import Title from '../../components/admin/Title';
import { dateFormat } from '../../lib/dateFormat';
import { apiFetch } from '../../lib/api';
import toast from 'react-hot-toast';

const ListShows = () => {

    const currency = import.meta.env.VITE_CURRENCY

    const [shows, setShows] = useState([]);
    const [loading, setLoading] = useState(true);

    const getAllShows = async () => {
        try {
            const data = await apiFetch('/api/shows')
            setShows(data.shows)
        }
        catch (error) {
            toast.error(error.message)
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        getAllShows();
    }, []);


    return !loading ? (
        <>
            <Title text1='List' text2='Shows' />
            <div className='max-w-4xl mt-6 overflow-x-auto'>
               
<table className='w-full border-collapse rounded-md overflow-hidden text-nowrap'>
    <thead>
        <tr className="bg-primary/20 text-left text-white">
            <th className="p-2 font-medium pl-5">Movie Name</th>
            <th className="p-2 font-medium">Show Time</th>
            <th className="p-2 font-medium">Total Bookings</th>
            <th className="p-2 font-medium">Earnings</th>
        </tr>
    </thead>
    <tbody>
        {shows.map((show, idx) => (
            <tr key={idx} className="border-b border-gray-700">
                <td className="p-2 pl-5">{show.movie.title}</td>
                <td className="p-2">{dateFormat(show.showDateTime)}</td>
                <td className="p-2">{Object.keys(show.occupiedSeats || {}).length}</td>
                <td className="p-2">{currency} {Object.keys(show.occupiedSeats || {}).length * show.showPrice}</td>
            </tr>
        ))}
    </tbody>
</table>

            </div>
        </>
    ) : <Loading />
}

export default ListShows
