import { useState, useEffect, useRef } from 'react';
import { getThisDayEvents, getFormatedDate } from './functions';
import { months } from './constants';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { getDatabase, ref, onValue, increment, update } from "firebase/database";

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [event, setEvent] = useState(null);
  const [calenderDate, setCalendarDate] = useState(new Date());
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [imageError, setImageError] = useState(null);
  const [viewCount, setViewCount] = useState(0);
  const calendarRef = useRef(null);

  useEffect(() => {
    getEvents(selectedDate);
    document.addEventListener('mousedown', handleClickOutside);
    
    // Initialize Firebase (make sure this is done in your app)
    // const app = initializeApp(firebaseConfig);
    const db = getDatabase();
    const viewsRef = ref(db, 'pageViews');

    // Increment view count
    update(viewsRef, {
      count: increment(1)
    });

    // Listen for changes to view count
    onValue(viewsRef, (snapshot) => {
      const data = snapshot.val();
      setViewCount(data.count);
    });

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedDate]);

  const getEvents = (day) => {
    console.log("Fetching events for:", getFormatedDate(day));
    getThisDayEvents(getFormatedDate(day)).then((res) => {
      console.log("API response:", res);
      setEvent(res);
      setImageError(null);
    }).catch(error => {
      console.error("Error fetching events:", error);
      setEvent(null);
    });
  };

  const handleDateChange = (day) => {
    const newSelectedDate = new Date(day);
    setSelectedDate(newSelectedDate);
    getEvents(newSelectedDate);
    setCalendarDate(newSelectedDate);
    setIsCalendarVisible(false);
  };

  const handleImageError = (error) => {
    console.error('Error loading image:', error);
    setImageError('Failed to load image');
  };

  const handleClickOutside = (event) => {
    if (calendarRef.current && !calendarRef.current.contains(event.target)) {
      setIsCalendarVisible(false);
    }
  };

  const minDate = new Date('2024-09-14');

  console.log("Current event state:", event);

  return (
    <div className="max-w-screen-lg mx-auto divide-y p-4 relative min-h-screen">
      <div className="pb-16"> {/* Main content wrapper */}
        <div className="mt-6 mb-6">
          <h1 className="text-4xl flex justify-between">
            <span>
              This Day on RTE News:
              <span className="inline-block bg-yellow-400 text-black rounded-lg px-2 ml-3 font-bold text-3xl">
                {months[selectedDate.getMonth()] + " "} {selectedDate.getDate()}
              </span>
            </span>
            <span
              onClick={() => setIsCalendarVisible(true)}
              className='px-6 py-2 font-semibold text-sm bg-cyan-900 text-white rounded-full 
              shadow-sm cursor-pointer absolute md:relative top-7 right-1 md:top-0 md:right-0'>
              <span className="md:leading-8">Different day</span>
              {
                isCalendarVisible && (
                  <span ref={calendarRef} className='absolute right-0 top-12 z-10 drop-shadow-2xl'>
                    <Calendar
                      onChange={(date) => handleDateChange(date)}
                      value={calenderDate}
                      minDate={minDate}
                    />
                  </span>
                )
              }
            </span>
          </h1>
          <p className="text-sm text-gray-500 mt-2">Start date: 14 September 2024</p>
        </div>
        {event ? (
          <div className="pt-6">
            <h2 className="text-2xl mb-4">Main Story That Day:</h2>
            <div className="max-w-5xl rounded-md drop-shadow-2xl border-solid bg-gray-600 grid gap-4 grid-cols-2 overflow-hidden">
              <div className="relative">
                <a href={event.link} target="_blank" rel="noopener noreferrer">
                  <img
                    src={event.imgSource}
                    onError={handleImageError}
                    alt="Featured event"
                    className="max-w-full h-auto cursor-pointer"
                  />
                </a>
                <p className="absolute bottom-0 left-0 text-sm p-2 bg-gray-800 bg-opacity-75 text-white">
                  <i className="text-xs md:text-sm">
                    © https://rte.ie/news
                  </i>
                </p>
              </div>
              <div className="pr-4 py-4 flex flex-col justify-between">
                <p>{event.textContent}</p>
                <a 
                  href={event.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-300 hover:text-blue-100 underline mt-2"
                >
                  Source
                </a>
              </div>
            </div>
            {imageError && <p className="text-red-500 mt-2">{imageError}</p>}
          </div>
        ) : (
          <p className="pt-4">
            Unfortunately we don't have information for this day.
          </p>
        )}
        <div className="bg-gray-700 text-white p-4 mt-10 rounded-md">
          <h2 className="text-lg font-bold">Project Explanation</h2>
          <p>
            This project integrates several technologies to achieve its functionality:
          </p><br></br>
          <ul className="list-disc pl-5">
            <li style={{ marginBottom: '10px' }}>
              <strong>React:</strong> Used for building the user interface and managing the state of the application. React's component-based architecture allows for a modular and maintainable codebase.
            </li>
            <li style={{ marginBottom: '10px' }}>
              <strong>Puppeteer:</strong> Utilised for web scraping. Puppeteer automates the browser to extract content from RTE.ie/news every night at midnight. This data is then saved to Firebase Storage for further processing.
            </li>
            <li style={{ marginBottom: '10px' }}>
              <strong>Firebase:</strong> Provides a comprehensive suite of tools for building and managing the backend. Firebase Firestore is used to store and query the scraped data, while Firebase Cloud Functions are scheduled to run periodically to perform the scraping. Firebase Cloud Storage is used to store the raw data collected by Puppeteer.
            </li>
            <li>
              <strong>Next.js:</strong> This framework is used for server-side rendering and building the web application. It ensures optimal performance for the web app.
            </li>
          </ul>
        </div>
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>Application created by Darragh Larkin (darraghlarkin@outlook.com)</p>
        </div>
      </div>
      
      {/* Page view counter positioned at bottom left */}
      <div className="fixed bottom-4 left-4 text-sm text-gray-500 bg-white bg-opacity-75 p-2 rounded shadow">
        <p>Page Views: {viewCount}</p>
      </div>
    </div>
  );
}

export default App;