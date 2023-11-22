const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const PORT = 3001;

//mongodb+srv://samanthasjohn22:Sam2002@cluster0.osd469u.mongodb.net/FoodDelivery?retryWrites=true&w=majority
mongoose.connect(`mongodb+srv://shaurya0148:zammy32@dbms.nfodoss.mongodb.net/FoodDelivery?retryWrites=true&w=majority`).then(() => {
  console.log('Database connected');
}, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const foodDeliverySchema = new mongoose.Schema({
  description: String,
  image: String,
  name: String,
  price: Number,
  type: String, // Assuming V/N means vegetarian or non-vegetarian
  
});

// Model for the Food Delivery products
const FoodDeliveryProduct = mongoose.model('FoodDeliveryProduct', foodDeliverySchema, 'SearchResults');

const corsOptions = {
  origin: 'http://localhost:3002',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

app.get('/search', async (req, res) => {
  const searchTerm = req.query.q;

  // Log the searchTerm
  console.log('Received search term:', searchTerm);

  try {
    let results;
    if (searchTerm) {
      results = await FoodDeliveryProduct.find({
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } },
        ],
      });
    } else {
      results = await FoodDeliveryProduct.find({});
    }

    console.log('Results from SearchResults collection:', results);

    res.json(results);
  } catch (error) {
    console.error('Error performing search:', error);
    res.status(500).json({
      error: 'Internal Server Error',
    });
  }
});

app.get('/product/:productId', async (req, res) => {
  const productId = req.params.productId;

  try {
    const product = await FoodDeliveryProduct.findById(productId);

    if (!product) {
      return res.status(404).json({
        error: 'Product not found'
      });
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    res.status(500).json({
      error: 'Internal Server Error'
    });
  }
});

// app.get('/product/:productId', async (req, res) => {
//   const productId = req.params.productId;

//   try {
//     const product = await Car.findById(productId);

//     if (!product) {
//       return res.status(404).json({
//         error: 'Product not found'
//       });
//     }

//     res.json(product);
//   } catch (error) {
//     console.error('Error fetching product by ID:', error);
//     res.status(500).json({
//       error: 'Internal Server Error'
//     });
//   }
// });

// app.get('/api/check-availability', async (req, res) => {
//   console.log('Received a request to check availability');
//   const model = req.query.model;

//   try {
//     const car = await Car.findOne({ model: new RegExp(model, 'i') });

//     if (!car) {
//       return res.status(404).json({
//         available: false,
//         error: 'Car not found'
//       });
//     }

//     res.json({ available: true });
//   } catch (error) {
//     console.error('Error checking availability:', error);
//     res.status(500).json({
//       available: false,
//       error: 'Internal Server Error'
//     });
//   }
// });

// app.get('/all-products', async (req, res) => {
//   try {
//     const allProducts = await Car.find({});
//     res.json(allProducts);
//   } catch (error) {
//     console.error('Error fetching all products:', error);
//     res.status(500).json({
//       error: 'Internal Server Error',
//     });
//   }
// });



// app.post('/api/add-car', async (req, res) => {
//   const { brand, model, year, image, availability } = req.body;

//   try {
//     const newCar = new Car({
//       brand,
//       model,
//       year,
//       image,
//       availability: parseInt(availability, 10), // Convert to a number
//     });

//     await newCar.save();

//     res.json({ message: 'Car added successfully' });
//   } catch (error) {
//     console.error('Error adding car:', error);
//     res.status(500).json({
//       error: 'Internal Server Error',
//     });
//   }
// });


const path = require('path')
// const shortid = require('shortid')
const Razorpay = require('razorpay')
const bodyParser = require('body-parser')

app.use(cors())
app.use(bodyParser.json())

const razorpay = new Razorpay({
	key_id: 'rzp_test_L68Sf16qS9R0mt',
    key_secret: 'XszdmFJtsg8ZjGfPkpgljmme'
})

app.post('/verification', (req, res) => {

	const secret = '12345678'

	console.log(req.body)

	const crypto = require('crypto')

	const shasum = crypto.createHmac('sha256', secret)
	shasum.update(JSON.stringify(req.body))
	const digest = shasum.digest('hex')

	console.log(digest, req.headers['x-razorpay-signature'])

	if (digest === req.headers['x-razorpay-signature']) {
		console.log('request is legit')
		// process it
		require('fs').writeFileSync('payment1.json', JSON.stringify(req.body, null, 4))
	} else {
		// pass it
	}
	res.json({ status: 'ok' })
})

app.post('/razorpay', async (req, res) => {
	const payment_capture = 1
	const amount = 500
	const currency = 'INR'

	const options = {
		amount: amount * 100,
		currency,
		// receipt: shortid.generate(),
		payment_capture
	}

	try {
		const response = await razorpay.orders.create(options)
		console.log(response)
		res.json({
			id: response.id,
			currency: response.currency,
			amount: response.amount
		})
	} catch (error) {
		console.log(error)
	}
})


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

