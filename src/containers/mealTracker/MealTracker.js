import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import ErrorMsg from "../../components/errorMsg/ErrorMsg";
import RecipeCard from '../../components/recipeCard/RecipeCard'
import { fetchFoodLogByDay, fetchFoodLogAddServing } from '../../services/fetchFoodLog';
import { ReactComponent as User } from '../../icons/user-solid.svg';
import "react-datepicker/dist/react-datepicker.css";
import './MealTracker.sass';
import NutritionalInfo from "../../components/nutritionalInfo/NutritionalInfo";
import { Link } from "react-router-dom";
import { SET_RECIPE_ID } from "../../store/actions/actionTypes";
import SetCaloriesModal from "../../components/setCaloriesModal/SetCaloriesModal";

const MealTracker = () => {
    const token = useSelector(state => state.loginState.token);
    const userId = useSelector(state => state.loginState.id);
    const history = useHistory();
    const dispatch = useDispatch();
    const [startDate, setStartDate] = useState(new Date());
    const [error, setError] = useState();
    const [logs, setLogs] = useState(null);
    const [openCalories, setOpenCalories] = useState(false);

    useEffect(() => {
        getLogsByDay(startDate);
    }, []);

    useEffect(() => {
        if (!token) history.push('/');
    }, [logs]);

    const getLogsByDay = async (date) => {
        try {
            let res = await fetchFoodLogByDay(date, token);
            if (res) {
                setLogs(res);
                setError(null);
            }
            if (!res) {
                setError('There are no records for this day');
                setLogs(null)
            }
        } catch (e) {
            setError('Service is currently unavailable, please try again later');
        }
    }
    
    const addServing = async (recipe) => {
        try {
            await fetchFoodLogAddServing(recipe._id, startDate, token);
            getLogsByDay(startDate);
            window.scrollTo(0, 0);
        } catch (e) {
            setError('Service is currently unavailable, please try again later');
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

    return (
        <div className='meal-tracker-view'>
            <h1 className='tracker-title'>Meal Tracker</h1>

            {error && <ErrorMsg>{error}</ErrorMsg>}

            <div className='user-tracker-info'>
                <div className='tracker-username'><User />User</div>
                <div className='calories-goal' onClick={() => setOpenCalories(true)}>
                    <div>Calories Goal</div>
                    <div>1500</div>
                </div>
            </div>

            {openCalories &&
                <SetCaloriesModal setOpenCalories={setOpenCalories}
                    open={openCalories}
                    onClose={() => setOpenCalories(false)}
                    id={userId}
                />
            }


            <div className='tracker-date-picker'>
                <div className='tracker-calendar-text'>Select the day you want to track:</div>
                <DatePicker
                    selected={startDate}
                    dateFormat='MM/dd/yyyy'
                    popperPlacement='bottom-end'
                    onChange={(date) => {
                        setStartDate(date);
                        getLogsByDay(date);
                    }}
                />
            </div>

            <div className='tracker-log'>
                <div className='tracker-nutritional-facts'>
                    <div className='tracker-nutritional-table'>
                        {logs &&
                            < NutritionalInfo
                                fat={logs.totalNutrients.totalFat}
                                saturatedFat={logs.totalNutrients.totalSaturatedFat}
                                sodium={logs.totalNutrients.totalSodium}
                                carbs={logs.totalNutrients.totalCarbs}
                                fiber={logs.totalNutrients.totalFiber}
                                sugar={logs.totalNutrients.totalSugar}
                                protein={logs.totalNutrients.totalProteins}
                            />}
                    </div>
                    <div className='tracker-pie-graph'>GRAPH</div>
                </div>
                {logs && logs.recipes.map(recipe =>
                    <div className='results-container'>
                        <Link to='/recipe' className='recipe-card-link'>
                            <RecipeCard
                                key={logs.recipes.indexOf(recipe)}
                                goToRecipe={goToRecipe(recipe._id)}
                                img={recipe.img}
                                title={recipe.title}
                                likes={recipe.timesFavorite}
                                calification={recipe.calification}
                                totalVotes={recipe.totalVotes}
                                calories={recipe.caloriesPerServe}
                            />
                        </Link>
                        <div className='add-serving-btn' onClick={() => addServing(recipe)}>Add a serving to the day</div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MealTracker;