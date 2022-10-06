import React from 'react';
import { Alert, AlertTitle } from '@material-ui/lab';

const StepUploadCSV = ({ t, csvError }) => {
	return (
		<div>
			<p>
				{t(
					'Please upload a CSV file containing the data for the message you want to send in bulk.'
				)}
			</p>
			<p className={'mt-3'}>
				{t(
					'The CSV file you upload must contain canonical phone numbers or tags representing recipients. In addition, this file may contain parameter data for the template message you will choose.'
				)}
			</p>
			{csvError !== undefined && (
				<Alert severity="error" className="bulkSendTemplateViaCSV__csvError">
					<AlertTitle>{t('Error')}</AlertTitle>
					{csvError}
				</Alert>
			)}
		</div>
	);
};

export default StepUploadCSV;
