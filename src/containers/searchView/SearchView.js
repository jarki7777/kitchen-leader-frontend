import './SearchView.sass';
import RecipeCard from '../../components/recipeCard/RecipeCard';
import { useState, useEffect } from 'react';
import Pagination from '../../components/pagination/Pagination';
import ErrorMsg from '../../components/errorMsg/ErrorMsg';
import { useSelector, useDispatch } from 'react-redux';
import { ReactComponent as Square } from '../../icons/square-regular.svg';
import { ReactComponent as SquareCheck } from '../../icons/check-square-regular.svg';
import { useHistory, Link } from 'react-router-dom';
import { fetchAll, fetchByInventory, fetchByKeyword } from '../../services/fetchRecipe';
import { SET_RECIPE_ID, SET_SEARCH_RESULTS } from '../../store/actions/actionTypes';

const SearchView = () => {
    const token = useSelector(state => state.loginState.token);
    const searchResults = useSelector(state => state.recipeState.searchResults);
    const history = useHistory();
    const dispatch = useDispatch();
    const [error, setError] = useState(null);
    const [totalPages, setTotalPages] = useState(1);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [prevPage, setPrevPage] = useState(false);
    const [nextPage, setNextPage] = useState(false);
    const [searchTerm, setSearchTerm] = useState(null);
    const [searchWithInventory, setSearchWithInventory] = useState(null);
    const [check, setCheck] = useState(false);

    useEffect(() => {
        if (!token) history.push('/');
    }, [token, history]);

    const search = async (event) => {
        event.preventDefault();
        const keyword = event.target[0].value;
        const withInventory = event.target[2].checked;
        setSearchTerm(keyword);
        setSearchWithInventory(withInventory);
        setTotalPages(null);
        setPage(1);
        setError(null);

        try {
            let res = null

            if (!keyword && !withInventory) {
                res = await fetchAll(page, limit, token);
            }

            if (keyword && !withInventory) {
                res = await fetchByKeyword(keyword, page, limit, token);
            }

            if (withInventory) {
                res = await fetchByInventory(page, limit, token);
            }

            setTotalPages(res.totalPages);
            setPrevPage(res.hasPrevPage);
            setNextPage(res.hasNextPage);
            dispatch(
                {
                    type: SET_SEARCH_RESULTS,
                    payload: res.docs
                }
            );
            if (res.docs.length === 0) setError('Sorry, no recipes were found');

        } catch (e) {
            setError('Service is currently unavailable, please try again later');
        }
    }

    const goPrevious = async () => {
        if (prevPage) {
            const newPage = page - 1;
            let res

            try {

                if (!searchTerm && !searchWithInventory) {
                    res = await fetchAll(newPage, limit, token);
                }

                if (searchTerm && !searchWithInventory) {
                    res = await fetchByKeyword(searchTerm, page, limit, token);
                }

                if (searchWithInventory) {
                    res = await fetchByInventory(page, limit, token);
                }

                setTotalPages(res.totalPages);
                setPrevPage(res.hasPrevPage);
                setNextPage(res.hasNextPage);
                setPage(res.page);
                dispatch(
                    {
                        type: SET_SEARCH_RESULTS,
                        payload: res.docs
                    }
                );
                window.scrollTo(0, 0);
            } catch (e) {
                setError('Service is currently unavailable, please try again later');
            }
        }
    }

    const goNext = async () => {
        if (nextPage) {
            const newPage = page + 1;
            try {

                let res = null;

                if (!searchTerm && !searchWithInventory) {
                    res = await fetchAll(newPage, limit, token);
                }

                if (searchTerm && !searchWithInventory) {
                    res = await fetchByKeyword(searchTerm, newPage, limit, token);
                }

                if (searchWithInventory) {
                    res = await fetchByInventory(newPage, limit, token);
                }

                setTotalPages(res.totalPages);
                setPrevPage(res.hasPrevPage);
                setNextPage(res.hasNextPage);
                setPage(res.page);
                dispatch(
                    {
                        type: SET_SEARCH_RESULTS,
                        payload: res.docs
                    }
                );
                window.scrollTo(0, 0);
            } catch (e) {
                setError('Service is currently unavailable, please try again later');
            }
        }
    }

    const goToRecipe = (id) => {
        dispatch(
            {
                type: SET_RECIPE_ID,
                payload: id
            }
        );
    }

    const switchCheck = () => {
        if (!check) setCheck(true)
        if (check) setCheck(false)
    }

    return (
        <div className='search-view-container'>

            {error && <ErrorMsg>{error}</ErrorMsg>}

            <form className='search-form' onSubmit={(event) => search(event)}>
                <div className='search-bar'>
                    <input className='input-text search-input' type='search' name='search' placeholder='Search by keyword'></input>
                    <button className='login-btn search-btn' name='submit' type='submit'>Find recipes</button>
                </div>
                <div className='search-with-inventory'>
                    {check ? <SquareCheck className='check-with-inventory' /> :
                        <Square className='check-with-inventory' />}
                    <label className='input-check' htmlFor='search-inventory'
                        onClick={() => switchCheck()}
                    >Check this to find recipes only with what you have</label>
                    <input className='input-check' type="checkbox" name='search by inventory' id='search-inventory'></input>
                </div>
            </form>
            <div className='results-container'>
                {searchResults.length === 0 && !error && <span>Use the search tools above to find your next favorite recipe!</span>}
                {searchResults.map(recipe => <Link className='recipe-card-link' to='/recipe' key={searchResults.indexOf(recipe)}>
                    <RecipeCard
                        goToRecipe={() => goToRecipe(recipe._id)}
                        img={recipe.img}
                        title={recipe.title}
                        calories={recipe.caloriesPerServe}
                        likes={recipe.timesFavorite}
                        calification={recipe.calification}
                        totalVotes={recipe.totalVotes}
                    /></Link>)}                    
            </div>

            <Pagination
                actualPage={page}
                totalPages={totalPages}
                goPrevious={() => goPrevious()}
                goNext={() => goNext()}
            />

        </div>
    );
}

export default SearchView;