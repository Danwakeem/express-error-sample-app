const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', (_, res) => {
  res.send({ message: 'root' });
});

router.get('/timeout/:id', async (_, res) => {
  const waitTillYouDie = () => new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 40000);
  });
  await waitTillYouDie();
  res.send({ message: 'root' });
});

router.get('/param/:first/another/:second', (req, res) => {
  res.send({
    message: `First: ${req.params.first}, Second: ${req.params.second}`,
  });
});

module.exports = router;
