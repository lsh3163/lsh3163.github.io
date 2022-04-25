---
title: Machine-Learning Mid Term
tags: Spring-ML1
---

머신러닝 수업 예상 문제 및 풀이

<!--more-->

---

### Mid-Term

- Find the dimensions of the box with largest volume if the total surface area is $64\text{cm}^2$.

$$\mathcal{L}=f(x,y,z)+\lambda(32-xy-yz-xz)$$

$$\mathcal{L}=xyz+\lambda(32-xy-yz-xz)$$

$$\mathcal{L}_x=yz+\lambda(-y-z)=0$$

$$\mathcal{L}_y=xz+\lambda(-x-z)=0$$

$$\mathcal{L}_z=xy+\lambda(-x-y)=0$$

$$\mathcal{L}_\lambda=32-xy-xz-yz=0$$

$x>0, y>0, z>0$ So 

$${xz\over x+z}={yz\over y+z}$$

$${x\over x+z}={y\over y+z}$$

$$xy+xz=xy+yz$$

$$x=y=z$$

$$x^2={32\over3}$$

$$f(x,y,z)=x^3={128\sqrt{2}\over3\sqrt{3}}$$

- Find the maximum and minimum of $f(x,y)=5x-3y$ subject to the constraint $x^2+y^2=136$

$$\mathcal{L}=5x-3y+\lambda\cdot(136-x^2-y^2)$$

$$\mathcal{L}_x=5-2 \lambda\cdot x=0$$

$$x={5\over2\lambda}, \because 
\lambda \neq 0$$

$$\mathcal{L}_y=-3-2\lambda\cdot y=0$$

$$y=-{3\over2\lambda} \because \lambda \neq 0$$

$$\mathcal{L}_\lambda=136-x^2-y^2=136-{34 \over 4\lambda^2}=0$$

$$\lambda=\pm{1\over4}$$

$$\lambda={1\over4}, f(x,y)=68$$

$$\lambda=-{1\over4}, f(x,y)=-68$$


- Find the maximum and minimum values of $f(x,y,z)=xyz$ subject to the constraint $x+y+z=1$. Assume that $x,y,z\geq0$.

$$\mathcal{L}=xyz+\lambda\cdot(1-x-y-z)$$

$$\mathcal{L}_x=yz-\lambda=0$$

$$\mathcal{L}_y=xz-\lambda=0$$

$$\mathcal{L}_z=xy-\lambda=0$$

$$\mathcal{L}_\lambda=1-x-y-z=0$$

if $x>0, y>0, z>0$

$$x=y=z={1\over3},f(x,y,z)={1\over27}$$

$$x=1,y=0,z=0,f(x,y,z)=0$$

- Find the maximum and minimum values of $f(x,y)=4x^2+10y^2$ on the disk $x^2+y^2 \leq 4$.

$$\mathcal{L}=4x^2+10y^2+\lambda\cdot(4-x^2-y^2)$$

$$\mathcal{L}_x=8x-2\lambda x=0$$

$$2x(4-\lambda)=0,x=0 \text{ or } \lambda=4$$

$$\mathcal{L}_y=20y-2\lambda y=0$$

$$2y(10-\lambda)=0,y=0 \text{ or } \lambda=10$$


$$\mathcal{L}_\lambda=4-x^2-y^2=0$$

if $x=0 \text{ and } y=0$, $f(0,0)=0$.

else if $x=0 \text{ and } \lambda=4$, $y=0$

else if $x=0 \text{ and } \lambda=10, -2\leq y \leq 2$, $f(x,y)=40$

else if $y=0 \text{ and } \lambda=4, -2\leq x \leq 2$, $f(x,y)=16$


- Find the maximum and minimum of $f(x,y,z)=4y-2z$ subject to the constraints $2x-y-z=2$ and $x^2+y^2=1$

$$\mathcal{L}=4y-2x+\lambda(2-2x+y+z)+\mu(1-x^2-y^2)$$


- Write pros and cons of Ridge and LASSO Regression.

Ridge - Analytic, theoretical gurantees, simple / limited interpretability, not reflect the nature of certain problems.

LASSO - Proven, Echoes particularly well / No closed-form solution.

- Write three regularization techniques you know and explain it. (ex. Weight Decay)

Weight Decay: Penalizes large weights, improves generalization.

Early Stopping.

Bagging: uses k different datasets.

Dropout: disable a random set of neurons

- What is Dropout?

Using half the network, consider it as two models in one.

- What is Batch Normalization?




- Differences of Linear regression and Kernel method.

- In RBF Kernel, What happens when RBF kernel has Large $\sigma$ or small $\sigma$?

- Why SVM uses signed distance instead of unsigned distance?

- Explain about two tricks in SVM!

- Find hyperplane function $h(x)$ and margin. There are four points and labels.

$x_1=\begin{bmatrix}0 \\ 0\end{bmatrix}, x_2=\begin{bmatrix}2 \\ 2\end{bmatrix}, x_3=\begin{bmatrix}2 \\ 0\end{bmatrix}, x_4=\begin{bmatrix}3 \\ 0\end{bmatrix}$

$y_1=-1,y_2=-1,y_3=+1, y_4=+1$ 

- Explain about Karush-Kahn-Tucker Conditions

- SVM Problem : $\text{minimize}_{u_1, u_2} u^2_1+u^2_2$, subject to $\begin{bmatrix} 1 & 2 \\ 1 & 0 \\ 0 & 1 \\ \end{bmatrix}
\begin{bmatrix} u_1 \\ u_2 \end{bmatrix} \geq \begin{bmatrix} 2 \\ 0 \\ 0 \\ \end{bmatrix}$

- If $C$ is big, then enforce $\xi$ to be small or big?

$\text{minimize}{1\over2}\|w\|^2_2+C\|\xi\|^2$

- Radial Basis Function takes the form of

$K(u,v)=\exp\{-\gamma \|u-v\|^2_2\}$,

What happens if $\gamma$ is too big?

- Write down the cross-entropy loss and explain why not use L2 loss.

- Average Pooling vs Max Pooling

- Explain SGD.

- Write down the delta rule term.

- Explain RNN and LSTM and Conv LSTM and GRU.

- AlexNet

- ZFNet

- VGGNet

- GoogleNet

- ResNet

- DenseNet

- Depth-wise Seperable Convolution

- EfficientNet v1

- Compound Scaling

- EfficientNet-v2

- Overfitting and Underfitting

- Random Initialization