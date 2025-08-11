'use client'

import { useEffect } from 'react'
import Aos from 'aos'
import { Provider } from 'react-redux'
import { store } from '@/store/store'
import { ToastContainer } from 'react-toastify'
import ScrollToTop from '@/components/common/ScrollTop'
import { FavoriteJobsProvider } from '@/contexts/FavoriteJobsContext'



export default function RootClientProviders({ children }) {
  useEffect(() => {
    Aos.init({ duration: 1400, once: true })
    // Import Bootstrap JS only on client side
    // eslint-disable-next-line global-require
    require('bootstrap/dist/js/bootstrap')
  }, [])

  return (
    <Provider store={store}>
      <FavoriteJobsProvider>
        <div className="page-wrapper">
          {children}

          {/* Toastify */}
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
          {/* Scroll To Top */}
          <ScrollToTop />
        </div>
      </FavoriteJobsProvider>
    </Provider>
  )
}


