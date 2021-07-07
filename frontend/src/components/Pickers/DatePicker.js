import React from 'react'
import dateFnsGenerateConfig from 'rc-picker/lib/generate/dateFns'
import generatePicker from 'antd/es/date-picker/generatePicker'
import 'antd/es/date-picker/style/index'
import fi from 'antd/lib/locale/fi_FI'
import { ConfigProvider } from 'antd'

fi.DatePicker.lang.locale = 'fi'

const GDatePicker = generatePicker(dateFnsGenerateConfig)

const DatePicker = React.forwardRef((props, ref) => {
  return <ConfigProvider locale={fi}><GDatePicker
    locale={fi}
    inputReadOnly={true}
    ref={ref}
    showNow={false}
    {...props}/>
  </ConfigProvider>
})

DatePicker.displayName = 'DatePicker'

export default DatePicker