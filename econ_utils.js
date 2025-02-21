function  getNetMixedFruitRevenue(yieldPerAcre) {
    if (yieldPerAcre > 6.88) {
        return 1017.44;
    } else if (yieldPerAcre < 6.87 && yieldPerAcre > 4.4) {
        return 404.13;
    } else if (yieldPerAcre < 4.3) {
        return 97.07;
    } else {
        return "Invalid input";
    }
}



getNetRevenue = getNetMixedFruitRevenue
// Example usage:
let yieldValue = 5.0;
console.log("Net Revenue per ton: $" +  getNetMixedFruitRevenue(yieldValue));