import React, { useRef } from 'react';
import {
  Button,
  NumberBox,
  SingleYearPicker,
  useSnackbar,
  AppIcon, // Assuming AppIcon is from @shared/index
} from '@shared/index'; // Assuming @shared/index exports AppIcon
import {
  Chip,
  Paper,
  Typography,
  CircularProgress,
  Box, // Added Box for layout structuring
} from '@mui/material';
import { useEnergyRecommendations } from './reommendHook';
import { generateRecommendationsPDF } from './recommendPDF';

const EnergyRecommendations = () => {
  const toast = useSnackbar();
  const {
    cityData,
    energyProductionItems,
    financialItems,
    futureProjections,
    isLoading,
    isInitialLoad,
    error,
    budgetValue,
    investmentYear,
    handleBudgetChange,
    handleInvestmentYearChange,
    handleRefresh,
  } = useEnergyRecommendations();

  const chartRef = useRef(null);
  const showFullScreenLoading = isInitialLoad && isLoading;

  const handleDownloadPDF = async () => {
    try {
      const numericBudget = parseInt(budgetValue, 10) || 0; // Added fallback
      const pdfData = {
        budget: numericBudget,
        year: investmentYear,
        location: cityData.city || 'N/A',
        solarPotential: cityData.location?.solarPotential || 'N/A',
        futureProjections: futureProjections,
        costBenefitAnalysis: [...energyProductionItems, ...financialItems],
      };
      const refs = { chartRef };
      await generateRecommendationsPDF(pdfData, refs, toast);
    } catch (err) { // Changed variable name to err
      console.error('Error downloading PDF:', err);
      toast.error('Failed to download PDF. Please try again.');
    }
  };

  // Helper component for consistent card structure
  const InfoCard = ({ title, titleIcon, titleIconBg, titleIconColor, value, unit, description, children, cardRef, borderColor = "border-gray-300" }) => (
    <Paper
      elevation={1} // Softer shadow than default Paper
      className={`rounded-lg overflow-hidden h-full flex flex-col border-t-4 ${borderColor}`} // Use border instead of div, ensure flex column
      ref={cardRef}
    >
      <Box sx={{ p: 2.5, flexGrow: 1 }}> {/* Use MUI spacing, allow content to grow */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          {titleIcon && (
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '8px', // Slightly softer radius
                bgcolor: titleIconBg || 'grey.100',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 1.5,
              }}
            >
              <AppIcon name={titleIcon} size={18} className={titleIconColor || 'text-gray-600'} />
            </Box>
          )}
          <Box>
            <Typography variant="subtitle1" component="h3" fontWeight="medium">
              {title}
            </Typography>
            {description && (
              <Typography variant="body2" color="text.secondary">
                {description}
              </Typography>
            )}
          </Box>
        </Box>
        {value && (
          <Typography variant="h5" component="p" fontWeight="bold" sx={{ mt: 2 }}>
            {value} {unit}
          </Typography>
        )}
        {children}
      </Box>
    </Paper>
  );

  return (
    <Box sx={{ bgcolor: 'grey.50', minHeight: '100vh' }}>
      {/* Header Section */}
      <div className="bg-green-700 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">Energy Recommendations</h1>
          </div>
          
          <div className="flex items-center">
            {isLoading && !isInitialLoad && (
              <CircularProgress size={20} className="text-white mr-3" />
            )}
            
            <Button
              variant="outlined"
              className="text-white border-white hover:bg-green-800"
              onClick={handleDownloadPDF}
              disabled={isLoading && isInitialLoad}
            >
             <AppIcon name={'download'} size={16} className="mr-1" />
              Download PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <Box sx={{ maxWidth: '1152px', mx: 'auto', p: { xs: 2, md: 3 } }}> {/* Responsive padding */}
        {/* Input Controls */}
        <Paper elevation={1} sx={{ mb: 3, borderRadius: '8px' }}>
          <Box sx={{ p: 2.5, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3, alignItems: 'flex-end' }}>
            <Box>
              <Typography component="label" variant="body2" fontWeight="medium" sx={{ display: 'block', mb: 1, color: 'text.secondary' }}>
                Budget Allocation
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <NumberBox
                  placeholder="Enter Budget"
                  value={budgetValue}
                  onChange={handleBudgetChange}
                  size="medium"
                  variant="outlined"
                  fullWidth
                  prefix="₱"
                  disabled={isLoading}
                />
                {isLoading && (
                  <CircularProgress size={20} sx={{ ml: 1.5, color: 'green.600' }} />
                )}
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                Minimum: ₱100,000
              </Typography>
            </Box>
            <Box>
               <Typography component="label" variant="body2" fontWeight="medium" sx={{ display: 'block', mb: 1, color: 'text.secondary', marginTop: '-95px' }}>
                Investment Year
              </Typography>
              <SingleYearPicker
                initialYear={investmentYear}
                onYearChange={handleInvestmentYearChange}
                disabled={isLoading}
                // Assuming SingleYearPicker can accept sx or className for styling
                sx={{ width: '100%' }} // Make picker take available space
              />
            </Box>
          </Box>
        </Paper>

        {/* Error Message */}
        {error && (
          <Paper elevation={0} sx={{ mb: 3, borderRadius: '8px', border: 1, borderColor: 'error.main', bgcolor: 'error.lightest' }}>
             <Box sx={{ p: 2, display: 'flex', alignItems: 'flex-start' }}>
              <AppIcon name="warning" size={20} className="text-red-600 mr-2 mt-0.5 flex-shrink-0" /> {/* Using classname for color here */}
              <Box>
                <Typography variant="subtitle2" fontWeight="medium" color="error.dark">
                  Error Loading Data
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {error}
                </Typography>
                <Button
                  variant="text"
                  size="small"
                  onClick={handleRefresh}
                  disabled={isLoading}
                  sx={{ color: 'error.main', mt: 1, px: 1, textTransform: 'none' }}
                >
                  Retry
                </Button>
              </Box>
            </Box>
          </Paper>
        )}

        {/* Three Column Layout */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 3, mb: 4 }}>
          {/* Card 1: Renewable Energy Potential */}
          <InfoCard
             title="Solar Potential"
            //  description={`Location: ${cityData.city || 'N/A'}`}
             titleIcon="solar"
             titleIconBg="yellow.100"
             titleIconColor="text-yellow-700" // Tailwind color class
             borderColor="border-yellow-500" // Tailwind border color class
          >
             <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
               Potential: <Typography component="span" fontWeight="medium">{cityData.location?.solarPotential || "High"}</Typography>
             </Typography>
             {/* <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
               Average Irradiation: ~5.5 kWh/m²/day
             </Typography> */}
          </InfoCard>


          {/* Card 2: Estimated Energy Production */}
           <InfoCard
             title="Estimated Production"
             description="Total energy per year"
             titleIcon="energy"
             titleIconBg="yellow.100"
             titleIconColor="text-yellow-700"
             borderColor="border-yellow-500"
             cardRef={chartRef}
             value={
                isLoading && !energyProductionItems.length
                ? <CircularProgress size={24} />
                : energyProductionItems.length > 0
                    ? energyProductionItems[0]?.value
                    : 'N/A' // Default if not loading and no data
                }
             unit={energyProductionItems.length > 0 ? energyProductionItems[0]?.unit : 'kWh'}
           />


          {/* Card 3: Future Projections */}
          <InfoCard
             title="Future Projections"
             titleIcon="trendingUp" // Example icon name
             titleIconBg="blue.100"
             titleIconColor="text-blue-700"
             borderColor="border-blue-500"
          >
            {futureProjections ? (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Chip
                    label={futureProjections.year}
                    size="small"
                    sx={{ bgcolor: 'blue.100', color: 'blue.800', mr: 1 }}
                  />
                  <Typography variant="body2" fontWeight="medium">{futureProjections.title}</Typography>
                </Box>
                <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, spaceY: 1 }}>
                  {Object.entries(futureProjections)
                    .filter(([key]) => !['year', 'title'].includes(key))
                    .map(([key, value], idx) => (
                      <Box component="li" key={idx} sx={{ display: 'flex', alignItems: 'center', typography: 'body2', color: 'text.secondary' }}>
                        <Box component="span" sx={{ height: 8, width: 8, mr: 1.5, borderRadius: '50%', bgcolor: 'blue.500', flexShrink: 0 }}></Box>
                        <Typography variant="body2" component="span" fontWeight="medium" color="text.primary" sx={{ mr: 0.5 }}>{key}:</Typography> {value}
                      </Box>
                    ))}
                </Box>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
                {isLoading ? 'Loading projections...' : 'No projection data available'}
              </Typography>
            )}
          </InfoCard>
        </Box>

        {/* Cost-Benefit Analysis */}
        <Typography variant="h6" component="h2" fontWeight="semibold" sx={{ mb: 2, color: 'grey.800' }}>
          Cost-Benefit Analysis
        </Typography>
        <Paper elevation={1} sx={{ borderRadius: '8px', overflow: 'hidden', borderTop: 4, borderColor: 'green.500' }}>
          <Box sx={{ p: 2.5 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
              {financialItems.length > 0 ? (
                financialItems.map((item, index) => (
                  <Box key={`financial-${index}`} sx={{ p: 1 }}> {/* Reduced padding inside grid */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                       <Box
                          sx={{
                            width: 32, height: 32, borderRadius: '6px', bgcolor: 'green.100',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 1.5, flexShrink: 0
                          }} >
                          <AppIcon name={item.icon || "chart"} size={16} className="text-green-700" />
                       </Box>
                      <Typography variant="body1" component="h4" fontWeight="medium">{item.label}</Typography>
                    </Box>
                    <Typography variant="h5" component="p" fontWeight="bold" sx={{ mt: 1.5 }}>
                      {isLoading ? <CircularProgress size={22} /> : item.value}
                    </Typography>
                     {item.description && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                           {item.description}
                        </Typography>
                     )}
                  </Box>
                ))
              ) : (
                // Fallback / Loading state for financial items
                <>
                  {[
                    { label: "Estimated Yearly Savings", icon: "savings", value: "PHP 4414.69" }, // Example placeholder values
                    { label: "Estimated ROI (Payback Period)", icon: "clock", value: "1.13 years" }
                  ].map((item, index) => (
                     <Box key={`loading-financial-${index}`} sx={{ p: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Box sx={{ width: 32, height: 32, borderRadius: '6px', bgcolor: 'green.100', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 1.5, flexShrink: 0 }} >
                               <AppIcon name={item.icon} size={16} className="text-green-700" />
                            </Box>
                           <Typography variant="body1" component="h4" fontWeight="medium">{item.label}</Typography>
                        </Box>
                        <Typography variant="h5" component="p" fontWeight="bold" sx={{ mt: 1.5 }}>
                           {isLoading ? <CircularProgress size={22} /> : item.value}
                        </Typography>
                     </Box>
                  ))}
                </>
              )}
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Full-screen Loading Overlay */}
      {showFullScreenLoading && (
        <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0, 0, 0, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: (theme) => theme.zIndex.modal }}>
          <Paper elevation={4} sx={{ p: 3, borderRadius: '8px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CircularProgress size={24} sx={{ color: 'green.500' }} />
              <Typography>Loading initial data...</Typography>
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default EnergyRecommendations;