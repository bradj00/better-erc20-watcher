
import  React, { useEffect } from 'react'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

const TxTimeOfDayChart = (props) => {
  
  useEffect(()=>{
    if (props.selectedAddressTxList){
      console.log('=====================')
      console.log(props.selectedAddressTxList)
      console.log(props.clockCountsArrayForSelectedAddressTxList)
      console.log('=====================')
    }
  },[props.selectedAddressTxList])
  

  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
  );

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'TX Times of Day',
      },
      maintainAspectRatio: false
    },
  };
  //make array named labels with 24 elements from 0 to 23
  const labels = Array.from({ length: 24 }, (_, i) => i);


  const data = {
    labels,
    datasets: [
      // {
      // //   label: 'Dataset 1',
      //   // data: labels.map(() => faker.datatype.number({ min: 0, max: 1000 })),
        
      //   data:[5,6,7,8,9,10 ],
      //   backgroundColor: 'rgba(255, 99, 132, 0.5)',
      // },
      {
      //   label: 'Dataset 2',
        // data: labels.map(() => faker.datatype.number({ min: 0, max: 1000 })),
        data:props.clockCountsArrayForSelectedAddressTxList? props.clockCountsArrayForSelectedAddressTxList : [],
        backgroundColor: 'rgba(53, 162, 235, 1)',
        color: 'rgba(255,255,255,1)'

      },
    ],
  };

  
  return (
    
      <Bar  options={options} data={data} height={100} width={100}     
      />
     
  )
}

export default TxTimeOfDayChart