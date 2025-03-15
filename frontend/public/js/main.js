document.addEventListener('DOMContentLoaded', () => {
    const claimBtn = document.getElementById('claimBtn');
    const result = document.getElementById('result');
    const couponCard = document.getElementById('couponCard');
    const errorCard = document.getElementById('errorCard');
    const couponCode = document.getElementById('couponCode');
    const couponValue = document.getElementById('couponValue');
    const couponDesc = document.getElementById('couponDesc');
    const errorMessage = document.getElementById('errorMessage');
    const timerMessage = document.getElementById('timerMessage');
    
    let countdownInterval;
    
    claimBtn.addEventListener('click', async () => {
        // Disable button to prevent multiple clicks
        claimBtn.disabled = true;
        claimBtn.textContent = 'Processing...';
        
        // Clear previous results
        result.classList.add('hidden');
        couponCard.classList.add('hidden');
        errorCard.classList.add('hidden');
        clearInterval(countdownInterval);
        
        try {
            // Make API request to claim coupon
            const response = await fetch('/api/coupon');
            const data = await response.json();
            
            // Show result
            result.classList.remove('hidden');
            
            if (response.ok) {
                // Show success card
                couponCard.classList.remove('hidden');
                couponCode.textContent = data.coupon.code;
                couponValue.textContent = data.coupon.value > 0 ? 
                    '$' + data.coupon.value.toFixed(2) : 
                    data.coupon.value + '%';
                couponDesc.textContent = data.coupon.description;
            } else {
                // Show error card
                errorCard.classList.remove('hidden');
                errorMessage.textContent = data.message || 'Failed to claim coupon';
                
                // If there's a rate limit error, show countdown timer
                if (response.status === 429 && data.nextAvailable) {
                    const nextAvailable = new Date(data.nextAvailable);
                    startCountdown(nextAvailable);
                }
            }
        } catch (error) {
            // Show error for network/server issues
            result.classList.remove('hidden');
            errorCard.classList.remove('hidden');
            errorMessage.textContent = 'Network error. Please try again later.';
            console.error('Error claiming coupon:', error);
        } finally {
            // Re-enable button
            claimBtn.disabled = false;
            claimBtn.textContent = 'Claim Coupon';
        }
    });
    
    // Countdown timer function
    function startCountdown(endTime) {
        function updateTimer() {
            const now = new Date();
            const timeDiff = endTime - now;
            
            if (timeDiff <= 0) {
                clearInterval(countdownInterval);
                timerMessage.textContent = 'You can claim a new coupon now!';
                return;
            }
            
            // Calculate minutes and seconds
            const minutes = Math.floor(timeDiff / (1000 * 60));
            const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
            
            timerMessage.textContent = `You can claim another coupon in ${minutes}m ${seconds}s`;
        }
        
        // Update immediately then start interval
        updateTimer();
        countdownInterval = setInterval(updateTimer, 1000);
    }
});